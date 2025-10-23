import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtils";
import type {
  PaginatedResponse,
  CreateOrderRequest,
  InvoiceType,
} from "@/types";
import { nanoid } from "nanoid";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const createOrderSchema = z.object({
  paymentMethodId: z.string().min(1),

  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        // optional per-item metadata (e.g. selected options, SKU info)
        metadata: z.any().optional(),
      })
    )
    .min(1),

  currency: z.string().optional().default("USD"),
  metadata: z.any().optional(),

  deliveryName: z.string().optional(),
  deliveryPhone: z.string().optional(),
  deliveryEmail: z.string().email().optional(),
  deliveryAddress1: z.string().optional(),
  deliveryAddress2: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZip: z.string().optional(),
  deliveryCountry: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z
    .enum([
      "DRAFT",
      "PENDING",
      "PAID",
      "PROCESSING",
      "COMPLETED",
      "CANCELED",
      "REFUNDED",
    ])
    .optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      status: searchParams.get("status") || undefined,
      userId: searchParams.get("userId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // If user is not admin/owner, only show their orders
    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      where.userId = user.id;
    } else if (query.userId) {
      where.userId = parseInt(query.userId);
    }

    if (query.status) {
      where.status = query.status;
    }

    // Search functionality
    if (query.search) {
      where.OR = [
        {
          orderNumber: {
            contains: query.search,
          },
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: query.search,
                },
              },
              {
                email: {
                  contains: query.search,
                },
              },
            ],
          },
        },
      ];
    }

    // Build orderBy object
    const orderBy: any = {};
    orderBy[query.sortBy] = query.sortOrder;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          agent: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { locale: "en" },
                    select: { title: true, description: true },
                  },
                  media: {
                    where: { type: "IMAGE" },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true, alt: true },
                  },
                },
              },
            },
          },
        },
        orderBy: orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      data: orders,
      total,
      page,
      limit,
      pages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Fetch products and validate they exist & active
    const productIds = validatedData.items.map((it: any) => it.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        translations: {
          where: { locale: "en" },
          select: { title: true },
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter(
        (id: number) => !foundIds.includes(id)
      );
      return NextResponse.json(
        { error: `Products not found or inactive: ${missingIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Prepare order items & totals
    let totalCents = 0;
    const orderItems = validatedData.items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPriceCents = Math.round((product.suggestedPrice || 0) * 100);
      const title = product.translations?.[0]?.title || `Product ${product.id}`;

      totalCents += unitPriceCents * item.quantity;

      return {
        productId: item.productId,
        title,
        unitPriceCents,
        quantity: item.quantity,
        metadata: item.metadata || {},
      };
    });

    // Generate order number
    const orderNumber = `ORD-${nanoid(8)}`;

    // Create order first (PENDING)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        totalCents,
        currency: validatedData.currency,
        status: "PENDING",
        metadata: validatedData.metadata || {},
        deliveryName: validatedData.deliveryName,
        deliveryPhone: validatedData.deliveryPhone,
        deliveryEmail: validatedData.deliveryEmail,
        deliveryAddress1: validatedData.deliveryAddress1,
        deliveryAddress2: validatedData.deliveryAddress2,
        deliveryCity: validatedData.deliveryCity,
        deliveryState: validatedData.deliveryState,
        deliveryZip: validatedData.deliveryZip,
        deliveryCountry: validatedData.deliveryCountry,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Ensure user has Stripe customer id
    if (!user.stripeCustomerId) {
      // delete order and error out
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
      return NextResponse.json(
        { error: "User is not set up for payments" },
        { status: 400 }
      );
    }

    const paymentMethodId: string = validatedData.paymentMethodId;

    // Create invoice and attempt payment (invoice + invoiceItems -> finalize -> pay)
    try {
      // create invoice
      const invoice = await stripe.invoices.create({
        customer: user.stripeCustomerId,
        currency: validatedData.currency.toLowerCase(),
        collection_method: "charge_automatically",
        metadata: {
          orderId: order.id.toString(),
          orderNumber,
          userId: user.id.toString(),
          type: "ORDER",
        },
        auto_advance: true,
      });

      // add invoice items
      for (const it of orderItems) {
        await stripe.invoiceItems.create({
          customer: user.stripeCustomerId,
          invoice: invoice.id,
          currency: validatedData.currency.toLowerCase(),
          amount: it.unitPriceCents * it.quantity,
          description: it.title,
          metadata: {
            productId: it.productId.toString(),
            orderId: order.id.toString(),
          },
        });
      }

      // finalize invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(
        invoice.id
      );

      // attempt to pay finalized invoice with provided payment method
      const paidInvoice: Stripe.Invoice = await stripe.invoices.pay(
        finalizedInvoice.id,
        {
          payment_method: paymentMethodId,
        }
      );

      const invoiceData = {
        stripeInvoiceId: invoice.id,
        userId: user.id,
        amountCents: invoice.amount_paid || 0,
        taxCents: 0,
        currency: invoice.currency || "usd",
        status: invoice.status || "paid",
        pdfUrl: invoice.invoice_pdf || null,
        hostedUrl: invoice.hosted_invoice_url || null,
        paidAt: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : null,
        type: "ORDER" as InvoiceType,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
      };

      // if invoice is paid
      if ((paidInvoice.status || "").toLowerCase() === "paid") {
        const dbInvoice = await prisma.invoice.upsert({
          where: {
            stripeInvoiceId: invoice.id,
          },
          update: invoiceData,
          create: invoiceData,
        });
        // update order to PAID
        try {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              invoiceId: dbInvoice.id,
              status: "PAID",
            },
            include: {
              items: true,
            },
          });

          return NextResponse.json(
            { order: updatedOrder, stripeInvoiceId: paidInvoice.id },
            { status: 201 }
          );
        } catch (updateErr) {
          console.log("-------------------- updateErr --------------------");
          console.log(updateErr);
          // DB update failed after successful payment — DO NOT refund.
          console.error("DB update failed after invoice paid:", updateErr);

          // delete order record (best-effort) and surface error for support to reconcile payment.
          await prisma.order
            .delete({ where: { id: order.id } })
            .catch(() => {});

          return NextResponse.json(
            {
              error:
                "Payment succeeded but saving order failed. Support will reconcile the payment.",
              stripeInvoiceId: paidInvoice.id,
            },
            { status: 500 }
          );
        }
      }

      // If the pay action resulted in a PaymentIntent that requires action (SCA),
      // stripe.invoices.pay may throw or return an invoice with payment_intent requiring action.
      // Try to detect and surface client_secret so frontend can complete SCA.
      const pi =
        (paidInvoice as any)?.payment_intent ||
        (finalizedInvoice as any)?.payment_intent ||
        null;

      if (
        pi &&
        (pi.client_secret || (pi as any).status === "requires_action")
      ) {
        const clientSecret =
          (pi as any).client_secret || (pi as any).client_secret === undefined
            ? (pi as any).client_secret
            : null;

        // keep order PENDING and return client_secret / payment intent id for frontend to handle SCA
        return NextResponse.json(
          {
            requiresAction: true,
            clientSecret: clientSecret,
            paymentIntentId: (pi as any).id || null,
            orderId: order.id,
            stripeInvoiceId: paidInvoice.id || invoice.id,
          },
          { status: 200 }
        );
      }

      // If we reach here and invoice is not paid and there's no actionable SCA, treat as failure
      console.error(
        "Invoice pay returned non-paid, non-actionable status:",
        paidInvoice.status
      );
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Payment failed", stripeStatus: paidInvoice.status },
        { status: 402 }
      );
    } catch (stripeErr: any) {
      console.error("Stripe error during invoice creation/payment:", stripeErr);

      // If stripe provides a payment_intent that needs action in the error payload, surface it
      if (stripeErr?.raw?.payment_intent?.client_secret) {
        // keep order PENDING and let frontend complete SCA
        return NextResponse.json(
          {
            requiresAction: true,
            clientSecret: stripeErr.raw.payment_intent.client_secret,
            paymentIntentId: stripeErr.raw.payment_intent.id,
            orderId: order.id,
            stripeInvoiceId: stripeErr?.invoice || null,
          },
          { status: 200 }
        );
      }

      // Otherwise payment definitively failed — delete order and return error
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {});

      if (stripeErr.type === "StripeCardError") {
        return NextResponse.json(
          { error: "Payment failed", details: stripeErr.message },
          { status: 402 }
        );
      }

      if (stripeErr.type === "StripeInvalidRequestError") {
        return NextResponse.json(
          { error: "Invalid payment request", details: stripeErr.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Payment processing failed",
          details: stripeErr.message || stripeErr,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in create-and-invoice flow:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
