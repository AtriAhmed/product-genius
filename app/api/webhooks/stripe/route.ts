import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/types";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function mapStripeStatusToDb(
  stripeStatus: string
): Promise<SubscriptionStatus> {
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

async function safeUpdateSubscription(
  stripeSubscriptionId: string,
  data: any,
  operation: string
) {
  try {
    const result = await prisma.subscription.updateMany({
      where: { stripeSubscriptionId },
      data,
    });

    if (result.count === 0) {
      console.warn(
        `No subscription found for ${operation}:`,
        stripeSubscriptionId
      );
    }

    return result;
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: any) {
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

    // Find plan by Stripe price ID
    const priceId = subscription.items?.data?.[0]?.price?.id;
    const plan = await prisma.plan.findFirst({
      where: { stripePriceId: priceId },
    });

    if (!plan) {
      console.error("Plan not found for price:", priceId);
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

    // Create subscription in database
    const dbStatus = await mapStripeStatusToDb(subscription.status);

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        stripeSubscriptionId: subscription.id,
        status: dbStatus,
        startsAt: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : new Date(),
        endsAt: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEndsAt: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
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
    // Find plan by Stripe price ID (in case of plan changes)
    const priceId = subscription.items?.data?.[0]?.price?.id;
    let planId = undefined;

    if (priceId) {
      const plan = await prisma.plan.findFirst({
        where: { stripePriceId: priceId },
      });

      if (plan) {
        planId = plan.id;
      }
    }

    // Update subscription in database
    const dbStatus = await mapStripeStatusToDb(subscription.status);
    const updateData: any = {
      status: dbStatus,
      startsAt: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : undefined,
      endsAt: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };

    // Only update planId if we found a matching plan
    if (planId) {
      updateData.planId = planId;
    }

    await safeUpdateSubscription(
      subscription.id,
      updateData,
      "subscription.updated"
    );

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

    console.log("Subscription canceled in database:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription.deleted:", error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    if (!invoice.subscription) return;

    const subscriptionId = invoice.subscription as string;

    // Update subscription status if it was incomplete
    const result = await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscriptionId,
        status: "INCOMPLETE",
      },
      data: {
        status: "ACTIVE",
      },
    });

    if (result.count === 0) {
      console.log(
        "No incomplete subscription found for payment success:",
        subscriptionId
      );
    }

    console.log("Invoice payment succeeded processed:", invoice.id);
  } catch (error) {
    console.error("Error handling invoice.payment_succeeded:", error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    if (!invoice.subscription) return;

    const subscriptionId = invoice.subscription as string;

    // Update subscription status
    await safeUpdateSubscription(
      subscriptionId,
      { status: "PAST_DUE" },
      "invoice.payment_failed"
    );

    console.log("Invoice payment failed processed:", invoice.id);
  } catch (error) {
    console.error("Error handling invoice.payment_failed:", error);
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
    console.error(
      "Error handling customer.subscription.trial_will_end:",
      error
    );
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
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

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleSubscriptionTrialWillEnd(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
