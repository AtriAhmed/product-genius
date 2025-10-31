import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide, isAuthorized } from "@/lib/authUtils";

const updateOrderSchema = z.object({
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
  shipmentStatus: z
    .enum([
      "PENDING",
      "PICKED",
      "IN_TRANSIT",
      "DELIVERED",
      "RETURNED",
      "CANCELLED",
    ])
    .optional(),
  agentId: z.number().int().positive().optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Build where clause based on user role
    const where: any = { id: orderId };

    // If user is not admin/owner, only show their orders
    if (!isAuthorized(user, ["ADMIN", "OWNER", "AGENT"])) {
      where.userId = user.id;
    }

    const order = await prisma.order.findFirst({
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
                  select: { url: true, alt: true, type: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Check if order exists and user has permission
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(isAuthorized(user, ["ADMIN", "OWNER"]) ? { userId: user.id } : {}),
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate agent assignment (only admins/owners can assign agents)
    if (
      validatedData.agentId &&
      !isAuthorized(user, ["ADMIN", "OWNER", "AGENT"])
    ) {
      return NextResponse.json(
        { error: "Only admins can assign agents to orders" },
        { status: 403 }
      );
    }

    // If assigning an agent, verify the agent exists and has the correct role
    if (validatedData.agentId) {
      const agent = await prisma.user.findUnique({
        where: { id: validatedData.agentId },
      });

      if (!agent || agent.role !== "AGENT") {
        return NextResponse.json(
          { error: "Invalid agent ID" },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: validatedData,
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
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await isAuthenticatedServerSide(["ADMIN", "OWNER"], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow deletion of draft or canceled orders
    if (
      existingOrder.status !== "DRAFT" &&
      existingOrder.status !== "CANCELED"
    ) {
      return NextResponse.json(
        { error: "Can only delete draft or canceled orders" },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
