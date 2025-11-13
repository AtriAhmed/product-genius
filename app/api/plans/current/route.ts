// Updated API routes for Plans with multiple PlanPrice support
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import Stripe from "stripe";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide(["USER"], true);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planId = user?.currentSubscription?.planId;

    let plan;

    if (planId) {
      plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          prices: true,
        },
      });
    } else {
      plan = await prisma.plan.findFirst({
        where: {
          isFree: true,
        },
        include: {
          prices: true,
        },
      });
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}
