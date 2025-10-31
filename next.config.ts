import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/media/**",
      },
    ],
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
  turbopack: {
    rules: {
      "*.svg": {
        // loaders: ["@svgr/webpack"],
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              dimensions: false,
            },
          },
        ],
        as: "*.ts",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
