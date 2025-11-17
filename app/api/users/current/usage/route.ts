import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { UserUsage } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const startsAt = user.currentSubscription?.startsAt || twoWeeksAgo;

    const importedProductsCount = await prisma.productMapping.count({
      where: { userId: user.id, createdAt: { gte: startsAt } },
    });

    const response: UserUsage = {
      importedProductsCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Current user fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
