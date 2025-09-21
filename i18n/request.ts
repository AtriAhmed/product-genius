import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Define the message files to import
  const messageFiles = ["login", "register", "navbar"];

  // Import all message files and organize them by namespace
  const messages: Record<string, any> = {};
  for (const file of messageFiles) {
    try {
      const module = await import(`./messages/${locale}/${file}.json`);
      messages[file] = module.default;
    } catch (error) {
      // File doesn't exist, skip it silently or log if needed
      console.warn(`Message file ${file}.json not found for locale ${locale}`);
    }
  }

  return {
    locale,
    messages,
  };
});
