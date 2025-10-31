import "@shopify/shopify-api/adapters/node";
import { ApiVersion, shopifyApi } from "@shopify/shopify-api";

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ["write_products", "read_products", "read_orders"],
  hostName: process.env.APP_URL!.replace(/https?:\/\//, ""),
  apiVersion: ApiVersion.October25,
  isEmbeddedApp: false,
});
