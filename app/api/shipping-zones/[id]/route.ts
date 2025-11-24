import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateShippingZoneSchema = z.object({
  name: z.string().min(1).optional(),
  countries: z.array(z.string().min(2).max(2)).min(1).optional(),
});

export async function GET(request: NextRequest, ctx: RouteContext<"/api/shipping-zones/[id]">) {
  try {
    const params = await ctx.params;
    const shippingZoneId = parseInt(params.id);

    if (isNaN(shippingZoneId)) {
      return NextResponse.json({ error: "Invalid shipping zone ID" }, { status: 400 });
    }

    const shippingZone = await prisma.shippingZone.findUnique({
      where: { id: shippingZoneId },
      include: {
        countries: true,
        _count: {
          select: {
            productShippingZones: true,
          },
        },
      },
    });

    if (!shippingZone) {
      return NextResponse.json({ error: "Shipping zone not found" }, { status: 404 });
    }

    return NextResponse.json(shippingZone);
  } catch (error) {
    console.error("Error fetching shipping zone:", error);
    return NextResponse.json({ error: "Failed to fetch shipping zone" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/shipping-zones/[id]">) {
  try {
    const params = await ctx.params;
    const shippingZoneId = parseInt(params.id);

    if (isNaN(shippingZoneId)) {
      return NextResponse.json({ error: "Invalid shipping zone ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = UpdateShippingZoneSchema.parse(body);

    const existingShippingZone = await prisma.shippingZone.findUnique({
      where: { id: shippingZoneId },
      include: {
        countries: true,
      },
    });

    if (!existingShippingZone) {
      return NextResponse.json({ error: "Shipping zone not found" }, { status: 404 });
    }

    if (validatedData.countries) {
      await prisma.shippingZoneCountry.deleteMany({
        where: { zoneId: shippingZoneId },
      });
    }

    const shippingZone = await prisma.shippingZone.update({
      where: { id: shippingZoneId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.countries && {
          countries: {
            create: validatedData.countries.map((countryCode) => ({
              countryCode,
            })),
          },
        }),
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

    return NextResponse.json({ shippingZone });
  } catch (error) {
    console.error("Error updating shipping zone:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update shipping zone" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/shipping-zones/[id]">) {
  try {
    const params = await ctx.params;
    const shippingZoneId = parseInt(params.id);

    if (isNaN(shippingZoneId)) {
      return NextResponse.json({ error: "Invalid shipping zone ID" }, { status: 400 });
    }

    const existingShippingZone = await prisma.shippingZone.findUnique({
      where: { id: shippingZoneId },
      include: {
        _count: {
          select: {
            productShippingZones: true,
          },
        },
      },
    });

    if (!existingShippingZone) {
      return NextResponse.json({ error: "Shipping zone not found" }, { status: 404 });
    }

    if (existingShippingZone._count.productShippingZones > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete shipping zone with associated products",
          productsCount: existingShippingZone._count.productShippingZones,
        },
        { status: 400 }
      );
    }

    await prisma.shippingZoneCountry.deleteMany({
      where: { zoneId: shippingZoneId },
    });

    await prisma.shippingZone.delete({
      where: { id: shippingZoneId },
    });

    return NextResponse.json({ message: "Shipping zone deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipping zone:", error);
    return NextResponse.json({ error: "Failed to delete shipping zone" }, { status: 500 });
  }
}
