import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import Stripe from "stripe";

const createSubscriptionSchema = z.object({
  planId: z.number(),
  paymentMethodId: z.string(),
});

const subscriptionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z
    .enum([
      "TRIALING",
      "ACTIVE",
      "PAST_DUE",
      "CANCELED",
      "INCOMPLETE",
      "UNPAID",
    ])
    .optional(),
  planId: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = subscriptionQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      planId: searchParams.get("planId"),
    });

    const userId = parseInt(session.user.id);
    const offset = (query.page - 1) * query.limit;

    const where = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.planId && { planId: query.planId }),
    };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: query.limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    const pages = Math.ceil(total / query.limit);

    return NextResponse.json({
      data: subscriptions,
      total,
      page: query.page,
      limit: query.limit,
      pages,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
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
    const { planId, paymentMethodId } = createSubscriptionSchema.parse(body);

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripe customer not found" },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        { error: "Plan not found or invalid" },
        { status: 400 }
      );
    }

    // Check if payment method belongs to user
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.customer !== user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Payment method does not belong to customer" },
        { status: 400 }
      );
    }

    // Create subscription in Stripe only
    // Database record will be created via webhook
    const stripeSubscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      default_payment_method: paymentMethodId,
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: user.id.toString(),
        planId: plan.id.toString(),
      },
    });

    // Get client secret for payment confirmation
    const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;

    console.log("-------------------- paymentIntent --------------------");
    console.log(invoice?.hosted_invoice_url);

    return NextResponse.json({
      hostedUrl: invoice?.hosted_invoice_url,
      subscriptionId: stripeSubscription.id,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
