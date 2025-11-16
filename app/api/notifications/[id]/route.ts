import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

const updateNotificationSchema = z.object({
  title: z.string().optional(),
  message: z.string().min(1).optional(),
  link: z.string().optional(),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).optional(),
  event: z
    .enum([
      "PRICE_CHANGE",
      "CARD_EXPIRED",
      "SUBSCRIPTION_EXPIRED",
      "SUBSCRIPTION_RENEWED",
      "ORDER_CREATED",
      "ORDER_ASSIGNED",
      "ORDER_SHIPPED",
      "ORDER_REFUNDED",
    ])
    .optional(),
  read: z.boolean().optional(),
});

export async function GET(request: NextRequest, ctx: RouteContext<"/api/notifications/[id]">) {
  const params = await ctx.params;

  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
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

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Users can only view their own notifications unless they're admin/owner
    if (notification.userId !== user.id && !["ADMIN", "OWNER"].includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Notification fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/notifications/[id]">) {
  const params = await ctx.params;

  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateNotificationSchema.parse(body);

    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Users can only update their own notifications, admins can update all
    const canUpdate = existingNotification.userId === user.id || ["ADMIN", "OWNER"].includes(user?.role || "");

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If marking as read, set readAt timestamp
    const updateData: any = { ...validatedData };
    if (validatedData.read === true && !existingNotification.read) {
      updateData.readAt = new Date();
    } else if (validatedData.read === false) {
      updateData.readAt = null;
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
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

    return NextResponse.json({ notification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }

    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/notifications/[id]">) {
  const params = await ctx.params;

  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Users can only delete their own notifications, admins can delete all
    const canDelete = notification.userId === user.id || ["ADMIN", "OWNER"].includes(user?.role || "");

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Notification deletion error:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
