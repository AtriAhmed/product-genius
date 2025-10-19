import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCustomer(id: number, email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: id.toString(),
      },
    });

    await prisma.user.update({
      where: { id },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer;
  } catch {
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Error canceling Stripe subscription:", error);
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
  }
) {
  try {
    const updateData: any = {};

    if (updates.priceId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      updateData.items = [
        {
          id: subscription.items.data[0].id,
          price: updates.priceId,
        },
      ];
      updateData.proration_behavior = "create_prorations";
    }

    if (typeof updates.cancelAtPeriodEnd === "boolean") {
      updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
    }

    return await stripe.subscriptions.update(subscriptionId, updateData);
  } catch (error) {
    console.error("Error updating Stripe subscription:", error);
    throw error;
  }
}
