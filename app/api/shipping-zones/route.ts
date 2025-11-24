import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateShippingZoneSchema = z.object({
  name: z.string().min(1),
  countries: z.array(z.string().min(2).max(2)).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const skip = (page - 1) * limit;

    const [shippingZones, total] = await Promise.all([
      prisma.shippingZone.findMany({
        where,
        include: {
          countries: true,
          _count: {
            select: {
              productShippingZones: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.shippingZone.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: shippingZones,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return NextResponse.json({ error: "Failed to fetch shipping zones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateShippingZoneSchema.parse(body);

    const shippingZone = await prisma.shippingZone.create({
      data: {
        name: validatedData.name,
        countries: {
          create: validatedData.countries.map((countryCode) => ({
            countryCode,
          })),
        },
      },
      include: {
        countries: true,
        _count: {
          select: {
            productShippingZones: true,
          },
        },
      },
    });

    return NextResponse.json({ shippingZone }, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping zone:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create shipping zone" }, { status: 500 });
  }
}
