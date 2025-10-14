// COMPLETE VERSION WITH STRIPE INTEGRATION
// Use this file after running: npm install stripe
// Replace the current [id]/route.ts content with this after installation

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PlanFeatureSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
  included: z.boolean(),
  note: z.string().optional(),
});

const UpdatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  interval: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]).optional(),
  active: z.boolean().optional(),
  features: z.array(PlanFeatureSchema).optional(),
  mostPopular: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/plans/[id]">
) {
  try {
    const params = await ctx.params;
    const planId = parseInt(params.id);

    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Latest 10 subscriptions
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/plans/[id]">
) {
  try {
    const params = await ctx.params;
    const planId = parseInt(params.id);

    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = UpdatePlanSchema.parse(body);

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update Stripe product if needed
    if (
      validatedData.name ||
      validatedData.description ||
      validatedData.active !== undefined
    ) {
      if (existingPlan.stripeProductId) {
        try {
          await stripe.products.update(existingPlan.stripeProductId, {
            name: validatedData.name || existingPlan.name,
            description:
              validatedData.description !== undefined
                ? validatedData.description
                : existingPlan.description,
            active:
              validatedData.active !== undefined
                ? validatedData.active
                : existingPlan.active,
            metadata: {
              planFeatures: JSON.stringify(
                validatedData.features || existingPlan.features || []
              ),
              mostPopular: (validatedData.mostPopular !== undefined
                ? validatedData.mostPopular
                : existingPlan.mostPopular
              ).toString(),
              sortOrder: (validatedData.sortOrder !== undefined
                ? validatedData.sortOrder
                : existingPlan.sortOrder
              ).toString(),
            },
          });
        } catch (error) {
          console.warn("Failed to update Stripe product:", error);
        }
      }
    }

    // Create new Stripe price if price or interval changed
    let newStripePriceId = null;
    if (
      (validatedData.price && validatedData.price !== existingPlan.price) ||
      (validatedData.interval &&
        validatedData.interval !== existingPlan.interval)
    ) {
      if (existingPlan.stripeProductId) {
        try {
          // Archive old prices
          const oldPrices = await stripe.prices.list({
            product: existingPlan.stripeProductId,
            active: true,
          });

          for (const price of oldPrices.data) {
            await stripe.prices.update(price.id, { active: false });
          }

          // Convert interval to Stripe format
          const intervalMap = {
            DAY: "day" as const,
            WEEK: "week" as const,
            MONTH: "month" as const,
            YEAR: "year" as const,
          };

          // Create new price
          const newPrice = await stripe.prices.create({
            product: existingPlan.stripeProductId,
            unit_amount: Math.round(
              (validatedData.price || existingPlan.price) * 100
            ),
            currency: "eur",
            recurring: {
              interval:
                intervalMap[validatedData.interval || existingPlan.interval],
            },
            active:
              validatedData.active !== undefined
                ? validatedData.active
                : existingPlan.active,
          });

          newStripePriceId = newPrice.id;
        } catch (error) {
          console.warn("Failed to create new Stripe price:", error);
        }
      }
    }

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.price !== undefined && {
          price: validatedData.price,
        }),
        ...(validatedData.interval && { interval: validatedData.interval }),
        ...(validatedData.active !== undefined && {
          active: validatedData.active,
        }),
        ...(validatedData.features && { features: validatedData.features }),
        ...(validatedData.mostPopular !== undefined && {
          mostPopular: validatedData.mostPopular,
        }),
        ...(validatedData.sortOrder !== undefined && {
          sortOrder: validatedData.sortOrder,
        }),
        ...(newStripePriceId && { stripePriceId: newStripePriceId }),
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error updating plan:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: "Stripe error", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/plans/[id]">
) {
  try {
    const params = await ctx.params;
    const planId = parseInt(params.id);

    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if plan has active subscriptions
    if (existingPlan._count.subscriptions > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete plan with active subscriptions. Deactivate the plan instead.",
        },
        { status: 400 }
      );
    }

    // Archive Stripe product and prices
    if (existingPlan.stripeProductId) {
      try {
        // Archive all prices first
        const prices = await stripe.prices.list({
          product: existingPlan.stripeProductId,
        });

        for (const price of prices.data) {
          if (price.active) {
            await stripe.prices.update(price.id, { active: false });
          }
        }

        // Archive product
        await stripe.products.update(existingPlan.stripeProductId, {
          active: false,
        });
      } catch (error) {
        console.warn("Failed to archive Stripe resources:", error);
      }
    }

    await prisma.plan.delete({
      where: { id: planId },
    });

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: "Stripe error", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
