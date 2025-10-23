import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtils";
import type { PaginatedResponse, Invoice } from "@/types";

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  type: z.enum(["PLAN", "ORDER"]).optional(),
  status: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "periodStart", "periodEnd", "amountCents"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication - allow ADMIN, OWNER, and USER (users can see their own invoices)
    const user = await isAuthenticatedServerSide(
      ["ADMIN", "OWNER", "USER"],
      true
    );
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validatedParams = querySchema.parse(params);

    const page = parseInt(validatedParams.page);
    const limit = parseInt(validatedParams.limit);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Regular users can only see their own invoices
    if (user.role === "USER") {
      where.userId = user.id;
    } else if (validatedParams.userId) {
      // Admin/Owner can filter by specific user
      where.userId = parseInt(validatedParams.userId);
    }

    if (validatedParams.type) {
      where.type = validatedParams.type;
    }

    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    // Build orderBy
    const orderBy = {
      [validatedParams.sortBy]: validatedParams.sortOrder,
    };

    // Get total count
    const total = await prisma.invoice.count({ where });

    // Get invoices with user relation
    const invoices = await prisma.invoice.findMany({
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
      orderBy,
      skip: offset,
      take: limit,
    });

    const pages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      data: invoices,
      total,
      page,
      limit,
      pages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching invoices:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
