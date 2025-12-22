import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Invoice, SubscriptionStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function mapStripeStatusToDb(stripeStatus: string): Promise<SubscriptionStatus> {
  const statusMap: { [key: string]: SubscriptionStatus } = {
    trialing: "TRIALING",
    active: "ACTIVE",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
  };

  return statusMap[stripeStatus] || "INCOMPLETE";
}

async function safeUpdateSubscription(stripeSubscriptionId: string, data: any, operation: string) {
  try {
    const result = await prisma.subscription.updateMany({
      where: { stripeSubscriptionId },
      data,
    });

    if (result.count === 0) {
      console.warn(`No subscription found for ${operation}:`, stripeSubscriptionId);
    }

    return result;
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error("User not found for customer:", customerId);
      return;
    }

    // Find plan by plan ID
    const planId = subscription.metadata?.planId;
    const plan = await prisma.plan.findUnique({
      where: { id: planId ? parseInt(planId) : -1 },
    });

    if (!plan) {
      console.error("Plan not found for plan:", planId);
      return;
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existingSubscription) {
      console.log("Subscription already exists:", subscription.id);
      return;
    }

    const dbStatus = await mapStripeStatusToDb(subscription.status);

    const dbSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        interval: subscription.metadata?.interval as any,
        stripeSubscriptionId: subscription.id,
        status: dbStatus,
        latestStripeInvoiceId: subscription.latest_invoice as string,
        startsAt: subscription.items?.data?.[0]?.current_period_start
          ? new Date(subscription.items?.data?.[0]?.current_period_start * 1000)
          : new Date(),
        endsAt: subscription.items?.data?.[0]?.current_period_end
          ? new Date(subscription.items?.data?.[0]?.current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentSubscriptionId: dbSubscription.id,
      },
    });

    console.log("Subscription created in database:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription.created:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Find plan by plan ID
    const planId = subscription.metadata?.planId;
    const plan = await prisma.plan.findUnique({
      where: { id: planId ? parseInt(planId) : -1 },
    });

    // Update subscription in database
    const dbStatus = await mapStripeStatusToDb(subscription.status);
    const updateData: any = {
      status: dbStatus,
      startsAt: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
      endsAt: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };

    // Only update planId if we found a matching plan
    if (planId) {
      updateData.planId = Number(planId);
    }

    // Update interval if provided in metadata
    if (subscription.metadata?.interval) {
      updateData.interval = subscription.metadata.interval;
    }

    await safeUpdateSubscription(subscription.id, updateData, "subscription.updated");

    console.log("Subscription updated in database:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription.updated:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Update subscription status to CANCELED
    await safeUpdateSubscription(
      subscription.id,
      {
        status: "CANCELED",
        cancelAtPeriodEnd: false,
      },
      "subscription.deleted"
    );

    const user = await prisma.user.findFirst({
      where: { currentSubscription: { stripeSubscriptionId: subscription.id } },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currentSubscriptionId: null },
      });
    }

    console.log("Subscription canceled in database:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription.deleted:", error);
    throw error;
  }
}

async function handleSubscriptionTrialWillEnd(subscription: any) {
  try {
    // This event can be used to notify users that their trial is ending
    // You might want to send an email or in-app notification here
    console.log("Subscription trial will end:", subscription.id);

    // Optionally update trial end date if it changed
    if (subscription.trial_end) {
      await safeUpdateSubscription(
        subscription.id,
        { trialEndsAt: new Date(subscription.trial_end * 1000) },
        "subscription.trial_will_end"
      );
    }
  } catch (error) {
    console.error("Error handling customer.subscription.trial_will_end:", error);
    throw error;
  }
}

async function handleInvoiceUpsert(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error("User not found for customer:", customerId);
      return;
    }

    // Determine invoice type by checking metadata and subscription
    const stripeSubscriptionId = invoice.lines.data[0]?.subscription as string;
    const orderId = invoice.metadata?.orderId;

    // Check if it's a subscription invoice
    const isSubscriptionInvoice = !!stripeSubscriptionId;
    const invoiceType: Invoice["type"] = isSubscriptionInvoice ? "PLAN" : "ORDER";

    // Prepare invoice data
    const invoiceData = {
      stripeInvoiceId: invoice.id,
      userId: user.id,
      stripeSubscriptionId: isSubscriptionInvoice ? stripeSubscriptionId : undefined,
      amountCents: invoice.total || 0,
      taxCents: 0,
      currency: invoice.currency || "usd",
      status: invoice.status || "draft",
      pdfUrl: invoice.invoice_pdf || null,
      hostedUrl: invoice.hosted_invoice_url || null,
      paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
      type: invoiceType,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      lastEventCreatedAt: invoice.created ? new Date(invoice.created * 1000) : new Date(),
    };

    // Upsert invoice in database
    const dbInvoice = await prisma.invoice.upsert({
      // The existing lastEventCreatedAt should be less than or equal to avoid overwriting with older data
      where: { stripeInvoiceId: invoice.id, lastEventCreatedAt: { lte: invoiceData.lastEventCreatedAt } },
      update: invoiceData,
      create: invoiceData,
    });

    console.log("Invoice upserted in database:", invoice.id, "Type:", invoiceType);

    // Update subscription if this is a subscription invoice
    if (isSubscriptionInvoice) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
          latestStripeInvoiceId: invoice.id,
        },
      });
    }

    // Update order if this is an order invoice
    if (orderId && !isSubscriptionInvoice) {
      const orderIdInt = parseInt(orderId);
      if (!isNaN(orderIdInt)) {
        await prisma.order.updateMany({
          where: { id: orderIdInt },
          data: {
            invoiceId: dbInvoice.id,
            ...(invoice.status === "paid" && { status: "PAID" }),
          },
        });
        console.log("Order updated with invoice ID:", orderIdInt);
      }
    }
  } catch (error) {
    console.error("Error handling invoice upsert:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json({ error: "No signature found" }, { status: 400 });
    }

    const body = Buffer.from(await request.arrayBuffer());

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body?.toString(), signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    console.log("Received Stripe webhook:", event.type);

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleSubscriptionTrialWillEnd(event.data.object);
        break;

      case "invoice.created":
        await handleInvoiceUpsert(event.data.object);
        break;

      case "invoice.updated":
        await handleInvoiceUpsert(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
