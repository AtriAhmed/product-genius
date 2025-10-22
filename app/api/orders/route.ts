import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtils";
import type { PaginatedResponse, CreateOrderRequest } from "@/types";
import { nanoid } from "nanoid";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  currency: z.string().optional().default("USD"),
  metadata: z.any().optional(),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z
    .enum([
      "DRAFT",
      "PENDING",
      "PAID",
      "PROCESSING",
      "COMPLETED",
      "CANCELED",
      "REFUNDED",
    ])
    .optional(),
  userId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      status: searchParams.get("status") || undefined,
      userId: searchParams.get("userId") || undefined,
    });

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // If user is not admin/owner, only show their orders
    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      where.userId = user.id;
    } else if (query.userId) {
      where.userId = parseInt(query.userId);
    }

    if (query.status) {
      where.status = query.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          agent: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { locale: "en" },
                    select: { title: true, description: true },
                  },
                  media: {
                    where: { type: "IMAGE" },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true, alt: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      data: orders,
      total,
      page,
      limit,
      pages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    const body: CreateOrderRequest = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Fetch products and validate they exist and are active
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        translations: {
          where: { locale: "en" },
          select: { title: true },
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Products not found or inactive: ${missingIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${nanoid()}`;

    // Calculate total
    let totalCents = 0;
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPriceCents = Math.round((product.suggestedPrice || 0) * 100);
      const title = product.translations?.[0]?.title || `Product ${product.id}`;

      totalCents += unitPriceCents * item.quantity;

      return {
        productId: item.productId,
        title,
        unitPriceCents,
        quantity: item.quantity,
        metadata: {},
      };
    });

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        totalCents,
        currency: validatedData.currency,
        status: "DRAFT",
        metadata: validatedData.metadata || {},
        items: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              include: {
                translations: {
                  where: { locale: "en" },
                  select: { title: true, description: true },
                },
                media: {
                  where: { type: "IMAGE" },
                  orderBy: { sortOrder: "asc" },
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
