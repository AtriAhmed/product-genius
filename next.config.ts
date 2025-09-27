import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.molinel.com",
        pathname: "/**",
      },
    ],
    // If you prefer the simpler form, you could use:
    // domains: ["www.molinel.com"],
  },
  // other config options...
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
