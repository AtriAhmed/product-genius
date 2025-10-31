import { Role } from "@/types";

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
] as const;

export type Currency = (typeof CURRENCIES)[number];

export const USER_ROLES: Record<Role, { label: string; access: number }> = {
  OWNER: { label: "owner", access: 5 },
  ADMIN: { label: "admin", access: 4 },
  EDITOR: { label: "editor", access: 3 },
  AGENT: { label: "agent", access: 3 },
  USER: { label: "user", access: 1 },
};

export type LanguageOption = {
  code: string;
  name: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "english" },
  { code: "fr", name: "french" },
  { code: "es", name: "spanish" },
  { code: "de", name: "german" },
  { code: "it", name: "italian" },
  { code: "pt", name: "portuguese" },
  { code: "ru", name: "russian" },
  { code: "ja", name: "japanese" },
  { code: "ko", name: "korean" },
  { code: "zh", name: "chinese" },
];
