import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import type { PayOrderRequest } from "@/types";

const payOrderSchema = z.object({
  paymentMethodId: z.string().min(1),
});

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = await isAuthenticatedServerSide([], true);
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id } = await params;
//     const orderId = parseInt(id);

//     if (isNaN(orderId)) {
//       return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
//     }

//     const body: PayOrderRequest = await request.json();
//     const { paymentMethodId } = payOrderSchema.parse(body);

//     // Check if order exists and belongs to user
//     const order = await prisma.order.findFirst({
//       where: {
//         id: orderId,
//         userId: user.id,
//       },
//       include: {
//         items: {
//           include: {
//             product: {
//               include: {
//                 translations: {
//                   where: { locale: "en" },
//                   select: { title: true },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!order) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     // Check if order can be paid
//     if (order.status !== "DRAFT" && order.status !== "UNPAID") {
//       return NextResponse.json(
//         { error: "Order cannot be paid in its current status" },
//         { status: 400 }
//       );
//     }

//     // Ensure user has a Stripe customer ID
//     if (!user.stripeCustomerId) {
//       return NextResponse.json(
//         { error: "User is not set up for payments" },
//         { status: 400 }
//       );
//     }

//     // Create line items for the invoice
//     const lineItems = order.items.map((item) => ({
//       price_data: {
//         currency: order.currency.toLowerCase(),
//         product_data: {
//           name: item.title,
//           metadata: {
//             productId: item.productId.toString(),
//             orderId: order.id.toString(),
//           },
//         },
//         unit_amount: item.unitPriceCents,
//       },
//       quantity: item.quantity,
//     }));

//     try {
//       // Create Stripe invoice
//       const invoice = await stripe.invoices.create({
//         customer: user.stripeCustomerId,
//         currency: order.currency.toLowerCase(),
//         collection_method: "charge_automatically",
//         metadata: {
//           orderId: order.id.toString(),
//           userId: user.id.toString(),
//           type: "PAYMENT",
//         },
//         auto_advance: true,
//       });

//       // Add invoice items
//       for (const lineItem of lineItems) {
//         await stripe.invoiceItems.create({
//           customer: user.stripeCustomerId,
//           invoice: invoice.id,
//           currency: order.currency.toLowerCase(),
//           amount: lineItem.price_data.unit_amount * lineItem.quantity,
//           description: lineItem.price_data.product_data.name,
//           metadata: lineItem.price_data.product_data.metadata,
//         });
//       }

//       // Finalize the invoice
//       const finalizedInvoice = await stripe.invoices.finalizeInvoice(
//         invoice.id
//       );

//       // Attempt to pay the invoice with the provided payment method
//       const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
//         payment_method: paymentMethodId,
//       });

//       // Update order status to PENDING (will be updated to PAID by webhook)
//       await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           status: "UNPAID",
//         },
//       });

//       return NextResponse.json({
//         success: true,
//         stripeInvoiceId: paidInvoice.id,
//         // clientSecret would be available if using PaymentIntents directly
//         // For invoices, the payment is handled differently
//       });
//     } catch (stripeError: any) {
//       console.error("Stripe payment error:", stripeError);

//       // Handle specific Stripe errors
//       if (stripeError.type === "StripeCardError") {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Payment failed",
//             details: stripeError.message,
//           },
//           { status: 400 }
//         );
//       }

//       if (stripeError.type === "StripeInvalidRequestError") {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Invalid payment request",
//             details: stripeError.message,
//           },
//           { status: 400 }
//         );
//       }

//       // For other Stripe errors or authentication issues
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Payment processing failed",
//           details: stripeError.message,
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error("Error processing payment:", error);

//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid request data",
//           details: error.issues,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Internal server error",
//       },
//       { status: 500 }
//     );
//   }
// }
