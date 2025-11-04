import { CategoryTranslation, ProductTranslation } from "@/types";

export function getCurrentTranslation(
  translations: ProductTranslation[],
  locale?: string
): ProductTranslation;

export function getCurrentTranslation(
  translations: CategoryTranslation[],
  locale?: string
): CategoryTranslation;

export function getCurrentTranslation(
  translations: ProductTranslation[] | CategoryTranslation[],
  locale: string = "en"
): ProductTranslation | CategoryTranslation {
  return (
    translations.find((t) => t.locale === locale) ||
    translations[0] || {
      locale,
      title: "",
      description: "",
    }
  );
}
