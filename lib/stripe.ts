import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCustomer(id: number, email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: id.toString(),
      },
    });

    await prisma.user.update({
      where: { id },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer;
  } catch {
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Error canceling Stripe subscription:", error);
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
  }
) {
  try {
    const updateData: any = {};

    if (updates.priceId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      updateData.items = [
        {
          id: subscription.items.data[0].id,
          price: updates.priceId,
        },
      ];
      updateData.proration_behavior = "create_prorations";
    }

    if (typeof updates.cancelAtPeriodEnd === "boolean") {
      updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
    }

    return await stripe.subscriptions.update(subscriptionId, updateData);
  } catch (error) {
    console.error("Error updating Stripe subscription:", error);
    throw error;
  }
}

/**
 * Get customer's default payment method
 * @param customerId Stripe customer ID
 * @returns Promise<string | null> payment method ID or null if none found
 */
export async function getCustomerDefaultPaymentMethod(
  customerId: string
): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      return null;
    }

    // Check if customer has a default payment method
    if (
      (customer as Stripe.Customer).invoice_settings?.default_payment_method
    ) {
      return (customer as Stripe.Customer).invoice_settings
        ?.default_payment_method as string;
    }

    // If no default, get the first attached payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });

    return paymentMethods.data.length > 0 ? paymentMethods.data[0].id : null;
  } catch (error) {
    console.error("Error getting customer default payment method:", error);
    return null;
  }
}

/**
 * Create and attempt to pay an invoice for an order
 * @param order Order data
 * @param customerId Stripe customer ID
 * @param paymentMethodId Payment method ID (optional)
 * @returns Promise with invoice result
 */
export async function createAndPayInvoice(
  order: {
    id: number;
    shopifyOrderId: string;
    totalCents: number;
    currency: string;
    userId: number;
    items: Array<{
      productId: number;
      quantity: number;
      unitPriceCents: number;
      title: string;
    }>;
  },
  customerId: string,
  paymentMethodId?: string | null
): Promise<{
  success: boolean;
  invoice: Stripe.Invoice | null;
  requiresAction: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}> {
  try {
    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      currency: order.currency.toLowerCase(),
      collection_method: "send_invoice",
      days_until_due: 5,
      metadata: {
        orderId: order.id.toString(),
        shopifyOrderId: order.shopifyOrderId,
        userId: order.userId.toString(),
        type: "ORDER",
      },
    });

    // Add invoice items
    for (const item of order.items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        currency: order.currency.toLowerCase(),
        amount: item.unitPriceCents * item.quantity,
        description: item.title,
        metadata: {
          productId: item.productId.toString(),
          orderId: order.id.toString(),
        },
      });
    }

    // Finalize invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // Attempt payment if payment method is provided
    if (paymentMethodId) {
      try {
        const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
          payment_method: paymentMethodId,
        });

        // Check if payment succeeded
        if (paidInvoice.status === "paid") {
          return {
            success: true,
            invoice: paidInvoice,
            requiresAction: false,
          };
        }

        // Check if requires action (SCA)
        const pi =
          (paidInvoice as any)?.payment_intent ||
          (finalizedInvoice as any)?.payment_intent;
        if (pi && (pi.client_secret || pi.status === "requires_action")) {
          return {
            success: false,
            invoice: paidInvoice,
            requiresAction: true,
            clientSecret: pi.client_secret,
            paymentIntentId: pi.id,
          };
        }

        return {
          success: false,
          invoice: paidInvoice,
          requiresAction: false,
          error: `Payment failed with status: ${paidInvoice.status}`,
        };
      } catch (paymentError: any) {
        // Check if payment error includes SCA requirements
        if (paymentError?.raw?.payment_intent?.client_secret) {
          return {
            success: false,
            invoice: finalizedInvoice,
            requiresAction: true,
            clientSecret: paymentError.raw.payment_intent.client_secret,
            paymentIntentId: paymentError.raw.payment_intent.id,
          };
        }

        return {
          success: false,
          invoice: finalizedInvoice,
          requiresAction: false,
          error: paymentError.message || "Payment failed",
        };
      }
    }

    // No payment method provided, return unpaid invoice
    return {
      success: false,
      invoice: finalizedInvoice,
      requiresAction: false,
      error: "No payment method provided",
    };
  } catch (error: any) {
    console.error("Error creating and paying invoice:", error);
    return {
      success: false,
      invoice: null,
      requiresAction: false,
      error: error.message || "Failed to create invoice",
    };
  }
}
