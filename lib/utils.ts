import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get media URL
export function getMediaUrl(mediaPath: string): string {
  // If it's an external URL, return as is
  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    return mediaPath;
  }

  // For local files, use our media serving route with path parameter
  // return `/api/media?path=${encodeURIComponent(mediaPath)}`;
  return `/api/media?path=${mediaPath}`;
}

// Helper function to check if URL is external
export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
