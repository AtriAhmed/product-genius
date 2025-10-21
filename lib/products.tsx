import { CategoryTranslation, ProductTranslation } from "@/types";

export function getCurrentTranslation(
  translations: ProductTranslation[],
  locale?: string
): ProductTranslation | null;

export function getCurrentTranslation(
  translations: CategoryTranslation[],
  locale?: string
): CategoryTranslation | null;

export function getCurrentTranslation(
  translations: ProductTranslation[] | CategoryTranslation[],
  locale: string = "en"
): ProductTranslation | CategoryTranslation | null {
  return (
    translations.find((t) => t.locale === locale) || translations[0] || null
  );
}
