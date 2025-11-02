import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import {
  createAndPayInvoice,
  getCustomerDefaultPaymentMethod,
} from "@/lib/stripe";
import { sendOrderPaymentNotification } from "@/lib/email";
import type { InvoiceType } from "@/types";

interface ShopifyOrderItem {
  variant_id: number;
  product_id: number;
  title: string;
  quantity: number;
  price: string;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  created_at: string;
  currency: string;
  total_price: string;
  line_items: ShopifyOrderItem[];
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
    const topic = request.headers.get("X-Shopify-Topic");
    const shop = request.headers.get("X-Shopify-Shop-Domain");

    console.log("Shopify webhook received:", { shop, topic });

    // Verify webhook is from Shopify
    const isValid = await shopify.webhooks.validate({
      rawBody: body,
      rawRequest: hmac,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
    }

    // Only process order creation webhooks
    if (topic !== "orders/create") {
      console.log("Ignoring webhook topic:", topic);
      return NextResponse.json({ success: true });
    }

    const shopifyOrder: ShopifyOrder = JSON.parse(body);
    console.log("Processing Shopify order:", shopifyOrder.order_number);

    // Find the Shopify store owner
    const shopifyStore = await prisma.shopifyStore.findUnique({
      where: { shop: shop || "" },
      include: { user: true },
    });

    if (!shopifyStore) {
      console.error("Shopify store not found:", shop);
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if order already exists (prevent duplicates)
    const existingOrder = await prisma.order.findFirst({
      where: {
        shopifyOrderId: shopifyOrder.id.toString(),
      },
    });

    if (existingOrder) {
      console.log("Order already exists:", shopifyOrder.order_number);
      return NextResponse.json({ success: true });
    }

    // Process line items and check for Product Genius mappings
    const validOrderItems = [];
    let totalCents = 0;

    for (const lineItem of shopifyOrder.line_items) {
      // Check if this Shopify variant is mapped to our products
      const variantMapping = await prisma.variantMapping.findFirst({
        where: {
          shopifyVariantId: lineItem.variant_id.toString(),
          userId: shopifyStore.userId,
        },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { locale: "en" },
                    select: { title: true },
                  },
                },
              },
            },
          },
          product: {
            include: {
              translations: {
                where: { locale: "en" },
                select: { title: true },
              },
            },
          },
        },
      });

      if (variantMapping) {
        const unitPriceCents = Math.round(parseFloat(lineItem.price) * 100);
        const itemTotal = unitPriceCents * lineItem.quantity;
        totalCents += itemTotal;

        // Use product directly from mapping
        const productTitle =
          variantMapping.product.translations[0]?.title || lineItem.title;

        validOrderItems.push({
          productId: variantMapping.productId,
          quantity: lineItem.quantity,
          unitPriceCents,
          title: productTitle,
          shopifyVariantId: lineItem.variant_id.toString(),
          shopifyProductId: lineItem.product_id.toString(),
        });
      }
    }

    // If no valid items found, skip order creation
    if (validOrderItems.length === 0) {
      console.log("No Product Genius items found in Shopify order");
      return NextResponse.json({ success: true });
    }

    // Generate order number
    const orderNumber = `ORD-${nanoid(8)}`;

    // Prepare delivery information
    const shippingAddress = shopifyOrder.shipping_address;
    const deliveryName = shippingAddress
      ? `${shippingAddress.first_name} ${shippingAddress.last_name}`.trim()
      : null;

    // Create order in our system
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: shopifyStore.userId,
        totalCents,
        currency: shopifyOrder.currency || "USD",
        status: "PENDING",
        shopifyOrderId: shopifyOrder.id.toString(),
        deliveryName,
        deliveryPhone: shippingAddress?.phone,
        deliveryEmail: shopifyOrder.email,
        deliveryAddress1: shippingAddress?.address1,
        deliveryAddress2: shippingAddress?.address2,
        deliveryCity: shippingAddress?.city,
        deliveryState: shippingAddress?.province,
        deliveryZip: shippingAddress?.zip,
        deliveryCountry: shippingAddress?.country,
        items: {
          create: validOrderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            title: item.title,
          })),
        },
      },
      include: {
        items: true,
        user: true,
      },
    });

    console.log("Order created:", order.orderNumber);

    // Ensure user has Stripe customer ID
    if (!order.user.stripeCustomerId) {
      console.error("User does not have Stripe customer ID");
      // Keep order as PENDING, user will need to set up payment method
      return NextResponse.json({
        success: true,
        message: "Order created but user needs to set up payment method",
      });
    }

    // Get customer's default payment method
    const defaultPaymentMethod = await getCustomerDefaultPaymentMethod(
      order.user.stripeCustomerId
    );

    // Create and attempt to pay invoice
    const invoiceResult = await createAndPayInvoice(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
        currency: order.currency,
        userId: order.userId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          title: item.title,
        })),
      },
      order.user.stripeCustomerId,
      defaultPaymentMethod
    );

    if (invoiceResult.success && invoiceResult.invoice) {
      // Payment successful - update order to PAID
      const invoiceData = {
        stripeInvoiceId: invoiceResult.invoice.id,
        userId: order.userId,
        amountCents: invoiceResult.invoice.amount_paid || 0,
        taxCents: 0,
        currency: invoiceResult.invoice.currency || "usd",
        status: invoiceResult.invoice.status || "paid",
        pdfUrl: invoiceResult.invoice.invoice_pdf || null,
        hostedUrl: invoiceResult.invoice.hosted_invoice_url || null,
        paidAt: invoiceResult.invoice.status_transitions?.paid_at
          ? new Date(invoiceResult.invoice.status_transitions.paid_at * 1000)
          : null,
        type: "ORDER" as InvoiceType,
        periodStart: new Date(invoiceResult.invoice.period_start * 1000),
        periodEnd: new Date(invoiceResult.invoice.period_end * 1000),
      };

      const dbInvoice = await prisma.invoice.upsert({
        where: { stripeInvoiceId: invoiceResult.invoice.id },
        update: {},
        create: invoiceData,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          invoiceId: dbInvoice.id,
          status: "PAID",
        },
      });

      console.log("Order payment successful:", order.orderNumber);
    } else if (invoiceResult.invoice) {
      // Payment failed or requires action - create unpaid invoice and send email
      const invoiceData = {
        stripeInvoiceId: invoiceResult.invoice.id,
        userId: order.userId,
        amountCents: invoiceResult.invoice.amount_due || 0,
        taxCents: 0,
        currency: invoiceResult.invoice.currency || "usd",
        status: invoiceResult.invoice.status || "open",
        pdfUrl: invoiceResult.invoice.invoice_pdf || null,
        hostedUrl: invoiceResult.invoice.hosted_invoice_url || null,
        paidAt: null,
        type: "ORDER" as InvoiceType,
        periodStart: new Date(invoiceResult.invoice.period_start * 1000),
        periodEnd: new Date(invoiceResult.invoice.period_end * 1000),
      };

      const dbInvoice = await prisma.invoice.upsert({
        where: { stripeInvoiceId: invoiceResult.invoice.id },
        update: {},
        create: invoiceData,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { invoiceId: dbInvoice.id },
      });

      // Send payment notification email
      const customerName =
        order.user.name ||
        (shopifyOrder.customer
          ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim()
          : "Customer");

      const totalAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: order.currency,
      }).format(order.totalCents / 100);

      const paymentUrl =
        invoiceResult.invoice.hosted_invoice_url ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`;

      await sendOrderPaymentNotification(
        order.deliveryEmail || order.user.email,
        {
          customerName,
          orderNumber: order.orderNumber,
          orderDate: new Date(shopifyOrder.created_at).toLocaleDateString(),
          itemCount: validOrderItems.length,
          totalAmount,
          paymentUrl,
        }
      );

      console.log("Order created with payment required:", order.orderNumber);
    } else {
      console.error("Failed to create invoice for order:", order.orderNumber);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      itemsProcessed: validOrderItems.length,
    });
  } catch (error) {
    console.error("Error processing Shopify order webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
