import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import type { PaginatedResponse, CreateOrderRequest, InvoiceType } from "@/types";
import { nanoid } from "nanoid";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const createOrderSchema = z.object({
  paymentMethodId: z.string().min(1),

  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        // optional per-item metadata (e.g. selected options, SKU info)
      })
    )
    .min(1),

  currency: z.string().optional().default("USD"),

  deliveryName: z.string().optional(),
  deliveryPhone: z.string().optional(),
  deliveryEmail: z.string().email().optional(),
  deliveryAddress1: z.string().optional(),
  deliveryAddress2: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZip: z.string().optional(),
  deliveryCountry: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z.enum(["DRAFT", "UNPAID", "PAID", "PROCESSING", "COMPLETED", "CANCELED", "REFUNDED"]).optional(),
  shipmentStatus: z.enum(["UNPAID", "PICKED", "IN_TRANSIT", "DELIVERED", "RETURNED", "CANCELLED"]).optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
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
      shipmentStatus: searchParams.get("shipmentStatus") || undefined,
      userId: searchParams.get("userId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // If user is not admin/owner, only show their orders
    if (!["ADMIN", "OWNER", "AGENT"].includes(user?.role || "")) {
      where.userId = user.id;
    } else if (query.userId) {
      where.userId = parseInt(query.userId);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.shipmentStatus) {
      where.shipmentStatus = query.shipmentStatus;
    }

    // Search functionality
    if (query.search) {
      where.OR = [
        {
          orderNumber: {
            contains: query.search,
          },
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: query.search,
                },
              },
              {
                email: {
                  contains: query.search,
                },
              },
            ],
          },
        },
      ];
    }

    // Build orderBy object
    const orderBy: any = {};
    orderBy[query.sortBy] = query.sortOrder;

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
          shopifyStore: {
            select: {
              id: true,
              shop: true,
            },
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
        orderBy: orderBy,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
