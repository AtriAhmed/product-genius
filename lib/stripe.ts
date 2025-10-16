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
