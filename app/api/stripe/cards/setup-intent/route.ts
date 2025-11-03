import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

// This endpoint creates a SetupIntent for securely collecting card details
export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: user?.stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session", // Allows charging the card later
    });

    return Response.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating setup intent:", error);

    return Response.json(
      { error: error.message || "Failed to create setup intent" },
      { status: 500 }
    );
  }
}
