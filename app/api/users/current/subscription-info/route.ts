import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { getUserSubscriptionInfo } from "@/lib/subscriptionInfoUtils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await getUserSubscriptionInfo(user?.id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Current user fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
