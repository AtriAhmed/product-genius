import axios from "axios";

export const createShopifyClient = (shop: string, accessToken: string) => {
  return axios.create({
    baseURL: `https://${shop}/admin/api/2025-10`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  });
};
