import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().optional(),
  message: z.string().min(1),
  link: z.string().optional(),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).default("INFO"),
  event: z.enum([
    "OPTIONS_CHANGED",
    "CARD_EXPIRED",
    "SUBSCRIPTION_EXPIRED",
    "SUBSCRIPTION_RENEWED",
    "ORDER_CREATED",
    "ORDER_ASSIGNED",
    "ORDER_SHIPPED",
    "ORDER_REFUNDED",
  ]),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  read: z.string().optional(),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).optional(),
  event: z
    .enum([
      "OPTIONS_CHANGED",
      "CARD_EXPIRED",
      "SUBSCRIPTION_EXPIRED",
      "SUBSCRIPTION_RENEWED",
      "ORDER_CREATED",
      "ORDER_ASSIGNED",
      "ORDER_SHIPPED",
      "ORDER_REFUNDED",
    ])
    .optional(),
  userId: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide(["OWNER", "ADMIN"], false);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: {
        userId: validatedData.userId,
        title: validatedData.title,
        message: validatedData.message,
        link: validatedData.link,
        type: validatedData.type,
        event: validatedData.event,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }

    console.error("Notification creation error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

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
      read: searchParams.get("read") || undefined,
      type: searchParams.get("type") || undefined,
      event: searchParams.get("event") || undefined,
      userId: searchParams.get("userId") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = {
      userId: user?.id,
    };

    if (query.read !== undefined) {
      where.read = query.read === "true";
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.event) {
      where.event = query.event;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: notifications,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }

    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
