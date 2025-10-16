import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.log("Webhook signature verification failed.", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  console.log("-------------------- event --------------------");
  console.log(event);

  // Handle the event
  switch (event.type) {
    // Subscription Events
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;

      try {
        await dbConnect();

        const planId = subscription.metadata?.plan_id;
        const entrepriseId = subscription.metadata?.entreprise_id;
        const billingPeriod = subscription.metadata?.billing_period as
          | "monthly"
          | "yearly"
          | "weekly"
          | "daily";

        console.log(
          "-------------------- planId, entrepriseId, billingPeriod --------------------"
        );
        console.log(planId, entrepriseId, billingPeriod);

        if (planId && entrepriseId) {
          // Get plan details to get pricing information
          const plan = await Plan.findById(planId);
          if (!plan) {
            console.error(`Plan not found: ${planId}`);
            break;
          }

          // Get pricing data
          let priceAtSubscription = 0;
          const currency = plan.currency;

          if (billingPeriod && plan.billing_options) {
            const billingOptionData = plan.billing_options[billingPeriod];
            if (billingOptionData) {
              priceAtSubscription = billingOptionData.current_price;
            }
          }

          // Helper function to safely convert Unix timestamp to Date
          const safeTimestampToDate = (
            timestamp: any,
            fallback: Date
          ): Date => {
            if (typeof timestamp === "number" && timestamp > 0) {
              const date = new Date(timestamp * 1000);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
            return fallback;
          };

          const now = new Date();

          const subscriptionUpdateData: any = {
            status: subscription.status,
            current_period_start: safeTimestampToDate(
              (subscription as any).current_period_start,
              now
            ),
            current_period_end: safeTimestampToDate(
              (subscription as any).current_period_end,
              new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            ),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
            canceled_at: (subscription as any).canceled_at
              ? safeTimestampToDate((subscription as any).canceled_at, now)
              : null,
            trial_start: (subscription as any).trial_start
              ? safeTimestampToDate((subscription as any).trial_start, now)
              : null,
            trial_end: (subscription as any).trial_end
              ? safeTimestampToDate((subscription as any).trial_end, now)
              : null,
            plan_link_code: subscription.metadata?.plan_link_code,
            latest_invoice: subscription.latest_invoice,
          };

          // If this is a new subscription (created event) or if we have complete data, set the full subscription data
          if (
            event.type === "customer.subscription.created" ||
            (billingPeriod && priceAtSubscription > 0)
          ) {
            subscriptionUpdateData.plan_id = planId;
            subscriptionUpdateData.entreprise_id = entrepriseId;
            subscriptionUpdateData.stripe_subscription_id = subscription.id;
            subscriptionUpdateData.currency = currency;

            if (billingPeriod) {
              subscriptionUpdateData.billing_period = billingPeriod;
            }

            if (priceAtSubscription > 0) {
              subscriptionUpdateData.price_at_subscription =
                priceAtSubscription;
            }
          }

          const updatedSubscription = await Subscription.findOneAndUpdate(
            { stripe_subscription_id: subscription.id },
            subscriptionUpdateData,
            { upsert: true, new: true }
          );

          // Update enterprise current subscription if it's active
          if (subscription.status === "active") {
            await Entreprise.findByIdAndUpdate(entrepriseId, {
              current_subscription: updatedSubscription._id,
              $addToSet: { subscriptions: updatedSubscription._id },
            });
          }

          console.log(
            `✅ Subscription ${subscription.status} for enterprise ${entrepriseId} (${event.type})`
          );
        }
      } catch (error) {
        console.error("Error processing subscription webhook:", error);
      }
      break;

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription;

      try {
        await dbConnect();

        await Subscription.findOneAndUpdate(
          { stripe_subscription_id: deletedSubscription.id },
          {
            status: "canceled",
            canceled_at: new Date(),
            latest_invoice: deletedSubscription.latest_invoice,
          }
        );

        // Remove current subscription from enterprise
        const entrepriseId = deletedSubscription.metadata?.entreprise_id;
        if (entrepriseId) {
          await Entreprise.findByIdAndUpdate(entrepriseId, {
            $unset: { current_subscription: 1 },
          });
        }

        // NEW: Auto-void any open and draft invoices for this subscription
        try {
          // Get all open and draft invoices for this subscription concurrently
          const [openInvoices, draftInvoices] = await Promise.all([
            stripe.invoices.list({
              subscription: deletedSubscription.id,
              status: "open",
              limit: 100, // Adjust as needed
            }),
            stripe.invoices.list({
              subscription: deletedSubscription.id,
              status: "draft",
              limit: 100, // Adjust as needed
            }),
          ]);

          // Void each open invoice
          for (const invoice of openInvoices.data) {
            await stripe.invoices.voidInvoice(invoice.id!);
            console.log(
              `✅ Voided open invoice ${invoice.id} after subscription cancellation`
            );
          }

          // Void each draft invoice
          for (const invoice of draftInvoices.data) {
            await stripe.invoices.voidInvoice(invoice.id!);
            console.log(
              `✅ Voided draft invoice ${invoice.id} after subscription cancellation`
            );
          }

          const totalVoidedInvoices =
            openInvoices.data.length + draftInvoices.data.length;
          if (totalVoidedInvoices > 0) {
            console.log(
              `✅ Voided ${totalVoidedInvoices} invoices (${openInvoices.data.length} open, ${draftInvoices.data.length} draft) for canceled subscription ${deletedSubscription.id}`
            );
          }
        } catch (invoiceError) {
          console.error(
            `❌ Error voiding invoices for subscription ${deletedSubscription.id}:`,
            invoiceError
          );
          // Don't throw - we still want the subscription to be marked as canceled
        }

        console.log(`✅ Subscription canceled: ${deletedSubscription.id}`);
      } catch (error) {
        console.error("Error processing subscription deletion webhook:", error);
      }
      break;
    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;

      try {
        await dbConnect();

        // Save invoice to database first
        if ((invoice as any).subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          );
          const entrepriseId = stripeSubscription.metadata?.entreprise_id;
          const subscriptionId = await Subscription.findOne({
            stripe_subscription_id: stripeSubscription.id,
          }).select("_id");

          if (entrepriseId) {
            await saveInvoiceToDatabase({
              stripeInvoice: invoice,
              entrepriseId,
              subscriptionId: subscriptionId?._id?.toString(),
            });
            console.log(`✅ Invoice saved to database: ${invoice.id}`);
          }
        }

        // --- Handle credit topup ---
        if (invoice.metadata?.type === "credit_topup" && invoice.customer) {
          // Find entreprise by stripe_customer_id
          const entreprise = await Entreprise.findOne({
            stripe_customer_id: invoice.customer,
          });
          if (entreprise) {
            const amount = Number(invoice.metadata.amount) || 0;
            await Entreprise.findByIdAndUpdate(entreprise._id, {
              $inc: { balance: amount },
            });
            console.log(
              `✅ Credit topup: Increased balance of entreprise ${entreprise._id} by ${amount}€ (invoice: ${invoice.id})`
            );
          } else {
            console.error(
              `❌ Credit topup: Entreprise not found for customer ${invoice.customer}`
            );
          }
        }

        if (
          (invoice as any).subscription &&
          (invoice as any).billing_reason === "subscription_cycle"
        ) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          );
          const planId = stripeSubscription.metadata?.plan_id;
          const entrepriseId = stripeSubscription.metadata?.entreprise_id;

          if (planId && entrepriseId) {
            // Payment model removed: skip payment record creation for subscription
            console.log(
              `✅ Subscription payment received for entreprise ${entrepriseId} (invoice: ${invoice.id})`
            );
          }
        }
      } catch (error) {
        console.error("Error processing invoice payment webhook:", error);
      }
      break;

    // Invoice updated event
    case "invoice.created":
    case "invoice.updated":
      const updatedInvoice = event.data.object as Stripe.Invoice;

      try {
        await dbConnect();

        // Determine entreprise ID from customer or subscription
        let entrepriseId: string | undefined;
        let subscriptionId: string | undefined;

        if ((updatedInvoice as any).subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            (updatedInvoice as any).subscription as string
          );
          entrepriseId = stripeSubscription.metadata?.entreprise_id;

          // Get our database subscription ID
          const dbSubscription = await Subscription.findOne({
            stripe_subscription_id: stripeSubscription.id,
          }).select("_id");
          subscriptionId = dbSubscription?._id?.toString();
        } else {
          // For non-subscription invoices, find entreprise by customer ID
          const entreprise = await Entreprise.findOne({
            stripe_customer_id: updatedInvoice.customer,
          }).select("_id");
          entrepriseId = entreprise?._id?.toString();
        }

        if (entrepriseId) {
          await saveInvoiceToDatabase({
            stripeInvoice: updatedInvoice,
            entrepriseId,
            subscriptionId,
          });
          console.log(`✅ Invoice updated and saved: ${updatedInvoice.id}`);
        }
      } catch (error) {
        console.error("Error processing invoice update webhook:", error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
