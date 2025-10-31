import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";

export async function POST(request: NextRequest) {
  console.log("-------------------- hi --------------------");

  const body = await request.text();
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
  const topic = request.headers.get("X-Shopify-Topic");
  const shop = request.headers.get("X-Shopify-Shop-Domain");

  console.log("-------------------- shop, topic, hmac --------------------");
  console.log(shop, topic, hmac);

  console.log("-------------------- body --------------------");
  console.log(body);

  // Verify webhook is from Shopify
  const isValid = await shopify.webhooks.validate({
    rawBody: body,
    rawRequest: hmac,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }

  const orderData = JSON.parse(body);

  console.log("-------------------- orderData --------------------");
  console.log(orderData);

  // Check if order contains products from your platform
  //   for (const item of orderData.line_items) {
  //     const isYourProduct = await checkIfProductIsFromYourPlatform(
  //       item.product_id
  //     );

  //     if (isYourProduct) {
  //       // Create order in your platform
  //       await createOrderInYourPlatform({
  //         shopifyOrderId: orderData.id,
  //         shopifyOrderNumber: orderData.order_number,
  //         productId: item.product_id,
  //         quantity: item.quantity,
  //         customerEmail: orderData.email,
  //         shippingAddress: orderData.shipping_address,
  //         // ... other relevant data
  //       });
  //     }
  //   }

  return NextResponse.json({ success: true });
}
