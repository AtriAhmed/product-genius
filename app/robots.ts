import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/en/admin", "/fr/admin", "/en/dashboard", "/fr/dashboard", "/en/auth", "/fr/auth"],
    },
    sitemap: "https://winwaterfall.com/sitemap.xml",
  };
}
