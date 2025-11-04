// Updated API routes for Plans with multiple PlanPrice support
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PlanFeatureSchema = z.object({
  key: z.string().min(1),
  value: z.string().optional(),
  description: z.string().min(1),
  included: z.boolean(),
  note: z.string().optional(),
});

const PlanPriceSchema = z.object({
  id: z.number().optional(), // For updating existing prices
  interval: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]),
  price: z.number().optional().nullable(),
  compareAtPrice: z.number().optional().nullable(),
});

const UpdatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  features: z.array(PlanFeatureSchema).optional(),
  mostPopular: z.boolean().optional(),
  sortOrder: z.number().optional(),
  prices: z
    .array(PlanPriceSchema)
    .refine((prices) => prices.some((price) => price.price !== undefined), {
      message: "At least one price must have a value",
    }),
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
        prices: true,
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
      include: {
        prices: true,
      },
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
            ...(validatedData.name && { name: validatedData.name }),
            ...(validatedData.description !== undefined && {
              description: validatedData.description,
            }),
            ...(validatedData.active !== undefined && {
              active: validatedData.active,
            }),
          });
        } catch (error) {
          console.warn("Failed to update Stripe product:", error);
        }
      }
    }

    // Handle price updates if provided
    if (validatedData.prices && existingPlan.stripeProductId) {
      const intervalMap = {
        DAY: "day" as const,
        WEEK: "week" as const,
        MONTH: "month" as const,
        YEAR: "year" as const,
      };

      // Archive old Stripe prices
      for (const existingPrice of existingPlan.prices) {
        if (!existingPrice.stripePriceId) continue;

        try {
          await stripe.prices.update(existingPrice.stripePriceId, {
            active: false,
          });
        } catch (error) {
          console.warn("Failed to archive old Stripe price:", error);
        }
      }

      // Create new Stripe prices
      const newPrices = await Promise.all(
        validatedData.prices.map(async (priceData) => {
          if (priceData.price === undefined || priceData.price === null) {
            return {
              ...priceData,
              stripePriceId: null,
            };
          }

          try {
            const stripePrice = await stripe.prices.create({
              product: existingPlan.stripeProductId!,
              unit_amount: Math.round(priceData.price * 100),
              currency: "eur",
              recurring: {
                interval: intervalMap[priceData.interval],
              },
            });

            return {
              ...priceData,
              stripePriceId: stripePrice.id,
            };
          } catch (error) {
            console.error("Failed to create Stripe price:", error);
            throw error;
          }
        })
      );

      // Update plan prices in database
      await prisma.planPrice.deleteMany({
        where: { planId: planId },
      });

      await prisma.planPrice.createMany({
        data: newPrices.map((priceData) => ({
          planId: planId,
          interval: priceData.interval,
          price: priceData.price,
          compareAtPrice: priceData.compareAtPrice || null,
          stripePriceId: priceData.stripePriceId,
        })),
      });
    }

    // Update plan basic information
    const plan = await prisma.plan.update({
      where: { id: planId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
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
      },
      include: {
        prices: true,
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
        prices: true,
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
        for (const price of existingPlan.prices) {
          if (!price.stripePriceId) continue;

          await stripe.prices.update(price.stripePriceId, {
            active: false,
          });
        }

        // Archive product
        await stripe.products.update(existingPlan.stripeProductId, {
          active: false,
        });
      } catch (error) {
        console.warn("Failed to archive Stripe resources:", error);
      }
    }

    // Delete prices first due to foreign key constraint
    await prisma.planPrice.deleteMany({
      where: { planId: planId },
    });

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
