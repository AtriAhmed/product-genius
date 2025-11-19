import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

export async function POST(request: NextRequest, ctx: RouteContext<"/api/stripe/cards/[id]/set-default">) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await ctx.params;
    const paymentMethodId = params.id;

    if (!paymentMethodId) {
      return Response.json({ error: "Payment method ID is required" }, { status: 400 });
    }

    const customerId = user.stripeCustomerId;
    if (!customerId) {
      return Response.json({ error: "User does not have a Stripe customer ID" }, { status: 400 });
    }

    // Verify the payment method belongs to the customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== customerId) {
      return Response.json({ error: "Payment method does not belong to this customer" }, { status: 403 });
    }

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return Response.json({
      success: true,
      message: "Default payment method updated successfully",
    });
  } catch (error: any) {
    console.error("Error setting default payment method:", error);

    return Response.json({ error: error.message || "Failed to set default payment method" }, { status: 500 });
  }
}
