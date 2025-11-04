import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get media URL
export function getMediaUrl(mediaPath?: string): string {
  if (!mediaPath) return "";

  // If it's an external URL, return as is
  if (mediaPath.includes("http://") || mediaPath.includes("https://")) {
    return mediaPath;
  }

  // For local files, use our media serving route with path parameter
  // return `/api/media?path=${encodeURIComponent(mediaPath)}`;
  return `/api/media?path=${mediaPath}`;
}

export function formatPrice(price: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-UK", {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
    trailingZeroDisplay: "stripIfInteger",
  }).format(price);
}

export function formatPriceCents(cents: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
}
