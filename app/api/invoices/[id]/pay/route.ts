import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { getCustomerDefaultPaymentMethod } from "@/lib/stripe";
import { stripe } from "@/lib/stripe";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number"),
});

export async function POST(request: NextRequest, ctx: RouteContext<"/api/invoices/[id]/pay">) {
  try {
    const params = await ctx.params;

    // Check authentication - allow ADMIN, OWNER, and USER (users can pay their own invoices)
    const user = await isAuthenticatedServerSide(["ADMIN", "OWNER", "USER"], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validatedParams = paramsSchema.parse(params);
    const invoiceId = parseInt(validatedParams.id);

    // Build where clause
    const where: any = { id: invoiceId };

    // Regular users can only pay their own invoices
    if (user.role === "USER") {
      where.userId = user.id;
    }

    // Find the invoice in our database
    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if user has Stripe customer ID
    if (!invoice.user.stripeCustomerId) {
      return NextResponse.json({ error: "User does not have Stripe customer ID" }, { status: 400 });
    }

    // Check if invoice is already paid
    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    // Get Stripe invoice
    if (!invoice.stripeInvoiceId) {
      return NextResponse.json({ error: "Invoice does not have Stripe invoice ID" }, { status: 400 });
    }

    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);

    if (!stripeInvoice) {
      return NextResponse.json({ error: "Stripe invoice not found" }, { status: 404 });
    }

    // Check if Stripe invoice is already paid
    if (stripeInvoice.status === "paid") {
      // Update our database to match Stripe
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "paid" },
      });

      return NextResponse.json({
        success: true,
        message: "Invoice is already paid",
        invoice: stripeInvoice,
      });
    }

    // Get customer's default payment method
    const defaultPaymentMethod = await getCustomerDefaultPaymentMethod(invoice.user.stripeCustomerId);

    if (!defaultPaymentMethod) {
      return NextResponse.json({ error: "No payment method found for customer" }, { status: 400 });
    }

    // Attempt to pay the invoice
    try {
      const paidInvoice = await stripe.invoices.pay(stripeInvoice.id, {
        payment_method: defaultPaymentMethod,
      });

      // Check if payment succeeded
      if (paidInvoice.status === "paid") {
        return NextResponse.json({
          success: true,
          message: "Invoice paid successfully",
          invoice: paidInvoice,
          requiresAction: false,
        });
      }

      // Check if requires action (SCA)
      const pi = (paidInvoice as any)?.payment_intent;
      if (pi && (pi.client_secret || pi.status === "requires_action")) {
        return NextResponse.json({
          success: false,
          message: "Payment requires additional authentication",
          invoice: paidInvoice,
          requiresAction: true,
          clientSecret: pi.client_secret,
          paymentIntentId: pi.id,
        });
      }

      return NextResponse.json({
        success: false,
        message: `Payment failed with status: ${paidInvoice.status}`,
        invoice: paidInvoice,
        requiresAction: false,
      });
    } catch (paymentError: any) {
      console.error("Payment error:", paymentError);

      // Check if payment error includes SCA requirements
      if (paymentError?.raw?.payment_intent?.client_secret) {
        return NextResponse.json({
          success: false,
          message: "Payment requires additional authentication",
          invoice: stripeInvoice,
          requiresAction: true,
          clientSecret: paymentError.raw.payment_intent.client_secret,
          paymentIntentId: paymentError.raw.payment_intent.id,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: paymentError.message || "Payment failed",
          error: paymentError.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error paying invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
