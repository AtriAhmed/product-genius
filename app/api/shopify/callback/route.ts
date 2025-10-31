import { isAuthenticatedServerSide } from "@/lib/authUtils";
import { prisma } from "@/lib/prisma";
import { createShopifyClient } from "@/lib/shopify-client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await isAuthenticatedServerSide(["USER"], true);

  if (!user) {
    return NextResponse.redirect(
      new URL("/dashboard/shopify?error=not_authenticated", request.url)
    );
  }

  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");

    if (!code || !shop) {
      return NextResponse.redirect(
        new URL("/dashboard/shopify?error=missing_params", request.url)
      );
    }

    // Exchange code for access token
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { access_token, scope } = response.data;

    const shopifyClient = createShopifyClient(shop, access_token);

    const storeRes = await shopifyClient.get("/shop.json");

    const existingStore = await prisma.shopifyStore.findUnique({
      where: { shop },
    });

    if (existingStore) {
      return NextResponse.redirect(
        new URL("/dashboard/shopify?error=store_already_connected", request.url)
      );
    } else {
      const shopifyStore = await prisma.shopifyStore.create({
        data: {
          shop,
          name: storeRes.data.shop.name,
          userId: user?.id,
          accessToken: access_token,
        },
      });
    }

    console.log("✅ Shopify store connected:", shop);

    return NextResponse.redirect(
      new URL("/dashboard/shopify?shopify_connected=true", request.url)
    );
  } catch (error) {
    console.error("Shopify OAuth error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/shopify?error=auth_failed", request.url)
    );
  }
}
