import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">
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

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Stripe subscription not found" },
        { status: 400 }
      );
    }

    // Get latest subscription data from Stripe
    const stripeSubscription: any = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update database with latest Stripe data
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: stripeSubscription.status?.toUpperCase() || subscription.status,
        startsAt: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : subscription.startsAt,
        endsAt: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : subscription.endsAt,
        trialEndsAt: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
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

    return NextResponse.json({
      subscription: updatedSubscription,
      synced: true,
    });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
