import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import sanitizeHtml from "sanitize-html";

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

export function hueFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360; // return hue (0–360)
}

export function htmlToText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [], // remove ALL tags
    allowedAttributes: {}, // remove ALL inline attributes
  }).trim();
}
