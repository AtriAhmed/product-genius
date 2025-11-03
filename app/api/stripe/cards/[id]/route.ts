import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/stripe/cards/[id]">
) {
  const params = await ctx.params;
  const id = params.id;
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethodId = params.id;

    if (!paymentMethodId) {
      return Response.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    const customerId = user.stripeCustomerId;
    if (!customerId) {
      return Response.json(
        { error: "User does not have a Stripe customer ID" },
        { status: 400 }
      );
    }

    // Verify the payment method belongs to the customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== customerId) {
      return Response.json(
        { error: "Payment method does not belong to this customer" },
        { status: 403 }
      );
    }

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return Response.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting payment method:", error);

    return Response.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
