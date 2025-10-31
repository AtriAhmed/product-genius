import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");

    if (!code || !shop) {
      return NextResponse.redirect(
        new URL("/connect-shopify?error=missing_params", request.url)
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

    console.log(
      "-------------------- access_token, scope --------------------"
    );
    console.log(access_token, scope);

    // ✅ Webhooks are now auto-registered via shopify.app.toml
    // No need to manually register them here!

    // Store credentials in your database
    // await prisma.shopifyStore.create({
    //   data: {
    //     userId: currentUserId,
    //     shop,
    //     accessToken: access_token,
    //     scopes: scope,
    //   },
    // });

    console.log("✅ Shopify store connected:", shop);

    return NextResponse.redirect(
      new URL("/dashboard?shopify_connected=true", request.url)
    );
  } catch (error) {
    console.error("Shopify OAuth error:", error);
    return NextResponse.redirect(
      new URL("/connect-shopify?error=auth_failed", request.url)
    );
  }
}
