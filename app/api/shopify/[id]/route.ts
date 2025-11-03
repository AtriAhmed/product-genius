import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/shopify/[id]">
) {
  const params = await ctx.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shopifyId = parseInt(params.id);

    if (isNaN(shopifyId)) {
      return NextResponse.json(
        { error: "Invalid Shopify store ID" },
        { status: 400 }
      );
    }

    // Check if the Shopify store exists
    const shopifyStore = await prisma.shopifyStore.findUnique({
      where: { id: shopifyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!shopifyStore) {
      return NextResponse.json(
        { error: "Shopify store not found" },
        { status: 404 }
      );
    }

    // Check if the current user owns this Shopify store
    if (shopifyStore.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this Shopify store" },
        { status: 403 }
      );
    }

    // Delete the Shopify store
    await prisma.shopifyStore.delete({
      where: { id: shopifyId },
    });

    return NextResponse.json(
      { message: "Shopify store deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting Shopify store:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
