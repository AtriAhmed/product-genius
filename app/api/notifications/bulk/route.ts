import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

const bulkUpdateSchema = z.object({
  ids: z.array(z.number()).min(1),
  read: z.boolean(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.number()).min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, read } = bulkUpdateSchema.parse(body);

    const updateData: any = { read };
    if (read) {
      updateData.readAt = new Date();
    } else {
      updateData.readAt = null;
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
      data: updateData,
    });

    return NextResponse.json({
      message: "Notifications updated successfully",
      updated: result.count,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }

    console.error("Bulk notification update error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = bulkDeleteSchema.parse(body);

    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Notifications deleted successfully",
      deleted: result.count,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }

    console.error("Bulk notification deletion error:", error);
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}
