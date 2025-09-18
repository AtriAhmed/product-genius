import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("locale")?.value || "en";

  // Define the message files to import
  const messageFiles = ["login", "settings", "profile"];

  // Import all message files and organize them by namespace
  const messages: Record<string, any> = {};
  for (const file of messageFiles) {
    try {
      const module = await import(`@/i18n/messages/${locale}/${file}.json`);
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
