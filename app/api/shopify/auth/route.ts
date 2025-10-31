import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop");

  if (!shop) {
    return NextResponse.json(
      { error: "Shop parameter required" },
      { status: 400 }
    );
  }

  // Validate shop domain format
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shopRegex.test(shop)) {
    return NextResponse.json({ error: "Invalid shop domain" }, { status: 400 });
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = "write_products,read_products,read_orders";
  const redirectUri = `${process.env.APP_URL}/api/shopify/callback`;
  const nonce = crypto.randomUUID();

  // TODO: Store nonce in session or database associated with this OAuth attempt
  // This is important for security - verify it in the callback

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`;

  return NextResponse.redirect(authUrl);
}
