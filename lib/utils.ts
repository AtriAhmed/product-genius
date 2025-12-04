import { clsx, type ClassValue } from "clsx";
import { customAlphabet } from "nanoid";
import sanitizeHtml from "sanitize-html";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get media URL
export function getMediaUrl(mediaPath?: string, fullForm: boolean = false): string {
  if (!mediaPath) return "";

  // If it's an external URL, return as is
  if (mediaPath.includes("http://") || mediaPath.includes("https://")) {
    return mediaPath;
  }

  if (fullForm) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/media?path=${mediaPath}`;
  }

  return `/api/media?path=${mediaPath}`;
}

export function formatCurrency(price: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
    trailingZeroDisplay: "stripIfInteger",
  }).format(price);
}

export function formatCurrencyCents(cents: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
    trailingZeroDisplay: "stripIfInteger",
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

export function nanoidLower(size?: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const generateId = customAlphabet(alphabet, size);
  return generateId();
}

export function stopPropagation(event: React.MouseEvent) {
  event.stopPropagation();
}
