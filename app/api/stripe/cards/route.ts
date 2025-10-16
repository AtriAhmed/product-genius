import { isAuthenticatedServerSide } from "@/lib/authUtils";
import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticatedServerSide([], true);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.stripeCustomerId) {
      return Response.json({ paymentMethods: [] });
    }

    // Retrieve all payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    // Get customer to check default payment method
    const customer = await stripe.customers.retrieve(user.stripeCustomerId, {
      expand: ["invoice_settings.default_payment_method"],
    });

    if (!customer || customer.deleted) {
      return Response.json({ paymentMethods: [] });
    }

    const defaultPaymentMethodId =
      (
        customer.invoice_settings
          ?.default_payment_method as Stripe.PaymentMethod
      )?.id || null;

    return Response.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            }
          : null,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);

    return Response.json(
      { error: error.message || "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
