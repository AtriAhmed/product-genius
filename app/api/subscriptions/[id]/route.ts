import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSubscription, cancelSubscription } from "@/lib/stripe";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  planId: z.number().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/subscriptions/[id]">
) {
  const params = await ctx.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
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
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/subscriptions/[id]">
) {
  const params = await ctx.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const body = await request.json();
    const updates = updateSubscriptionSchema.parse(body);

    // Check if subscription exists and belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Stripe subscription not found" },
        { status: 400 }
      );
    }

    let newPlan = null;

    if (updates.planId && updates.planId !== subscription.planId) {
      newPlan = await prisma.plan.findUnique({
        where: { id: updates.planId },
      });

      if (!newPlan?.stripePriceId) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
    }

    // Update in Stripe only - database will be updated via webhook
    await updateSubscription(subscription.stripeSubscriptionId, {
      priceId: newPlan?.stripePriceId || undefined,
      cancelAtPeriodEnd: updates.cancelAtPeriodEnd,
    });

    return NextResponse.json({
      message: "Subscription update initiated",
      subscriptionId: subscription.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/product-mappings/[id]">
) {
  const params = await ctx.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Check if subscription exists and belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Cancel in Stripe only - database will be updated via webhook
    if (subscription.stripeSubscriptionId) {
      await cancelSubscription(subscription.stripeSubscriptionId);
    }

    return NextResponse.json({
      message: "Subscription cancellation initiated",
      subscriptionId: subscription.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
