// COMPLETE VERSION WITH STRIPE INTEGRATION
// Use this file after running: npm install stripe
// Replace the current route.ts content with this after installation

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

const CreatePlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  oldPrice: z.number().min(0).optional(),
  price: z.number().min(0),
  interval: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]),
  active: z.boolean().default(true),
  features: z.array(PlanFeatureSchema).optional(),
  mostPopular: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Apply filters
    if (filter === "active") {
      where.active = true;
    } else if (filter === "inactive") {
      where.active = false;
    } else if (filter === "popular") {
      where.mostPopular = true;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder };
        break;
      case "price":
        orderBy = { price: sortOrder };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder };
        break;
      case "sortOrder":
      default:
        orderBy = { sortOrder: sortOrder };
        break;
    }

    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.plan.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: plans,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePlanSchema.parse(body);

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: validatedData.name,
      description: validatedData.description,
      metadata: {
        type: "subscription_plan",
      },
    });

    // Convert interval to Stripe format
    const intervalMap = {
      DAY: "day" as const,
      WEEK: "week" as const,
      MONTH: "month" as const,
      YEAR: "year" as const,
    };

    // Create Stripe price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(validatedData.price * 100), // Convert to cents
      currency: "eur",
      recurring: {
        interval: intervalMap[validatedData.interval],
      },
    });

    // Create plan in database
    const plan = await prisma.plan.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        oldPrice: validatedData.oldPrice ?? undefined,
        price: validatedData.price,
        interval: validatedData.interval,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        active: validatedData.active,
        features: validatedData.features || [],
        mostPopular: validatedData.mostPopular,
        sortOrder: validatedData.sortOrder,
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);

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
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
