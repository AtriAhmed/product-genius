import { isAuthenticatedServerSide } from "@/lib/authUtils";
import { prisma } from "@/lib/prisma";
import { createShopifyClient } from "@/lib/shopify-client";
import { generateVariants } from "@/lib/variant-generator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await isAuthenticatedServerSide([], true);
  const shopifyStore = user?.shopifyStores?.[0];

  const shop = shopifyStore?.shop;

  if (!shopifyStore) {
    return NextResponse.json(
      { error: "Shopify store not connected" },
      { status: 400 }
    );
  }

  const query = `
      query order($id: ID!) {
        order(id: $id) {
          id
          name
          email
          createdAt
          currencyCode
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 50) {
            nodes {
              id
              title
              quantity
              sku
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customAttributes {
                key
                value
              }
              variant {
                id
                title
                sku
              }
            }
          }
          shippingAddress {
            name
            address1
            address2
            city
            country
            zip
            phone
          }
        }
      }
    `;
  const order = await prisma.order.findFirst({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" },
  });

  const orderId = `gid://shopify/Order/${order?.shopifyOrderId}`;

  const variables = { id: orderId };

  const shopifyClient = createShopifyClient(
    shopifyStore.shop!,
    shopifyStore.accessToken!
  );

  const response = await shopifyClient.post("/graphql.json", {
    query,
    variables,
  });

  console.log(
    "-------------------- JSON.stringify(response.data, null, 2) --------------------"
  );
  console.log(JSON.stringify(response.data, null, 2));

  return NextResponse.json({ data: response.data });
}
