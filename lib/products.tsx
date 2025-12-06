import { CategoryTranslation, ProductTranslation } from "@/types";
import { generateSignedUrl } from "@/lib/r2";

export async function generateSignedUrlsForProduct<
  T extends {
    media?: Array<{ key?: string | null; posterKey?: string | null; url?: string | null; poster?: string | null }>;
  }
>(product: T): Promise<T> {
  if (!product.media || product.media.length === 0) {
    return product;
  }

  const mediaWithSignedUrls = await Promise.all(
    product.media.map(async (media) => {
      const updatedMedia = { ...media };

      // Generate signed URL for main media key
      if (media.key) {
        try {
          updatedMedia.url = await generateSignedUrl(media.key);
        } catch (error) {
          console.error(`Failed to generate signed URL for media key ${media.key}:`, error);
        }
      }

      // Generate signed URL for poster key
      if (media.posterKey) {
        try {
          updatedMedia.poster = await generateSignedUrl(media.posterKey);
        } catch (error) {
          console.error(`Failed to generate signed URL for poster key ${media.posterKey}:`, error);
        }
      }

      return updatedMedia;
    })
  );

  return {
    ...product,
    media: mediaWithSignedUrls,
  };
}

export async function generateSignedUrlsForProducts<
  T extends {
    media?: Array<{ key?: string | null; posterKey?: string | null; url?: string | null; poster?: string | null }>;
  }
>(products: T[]): Promise<T[]> {
  return await Promise.all(products.map((product) => generateSignedUrlsForProduct(product)));
}

export function getCurrentTranslation(translations: ProductTranslation[], locale?: string): ProductTranslation | null;

export function getCurrentTranslation(translations: CategoryTranslation[], locale?: string): CategoryTranslation | null;

export function getCurrentTranslation(
  translations: ProductTranslation[] | CategoryTranslation[],
  locale: string = "en"
): ProductTranslation | CategoryTranslation | null {
  return translations.find((t) => t.locale === locale) || translations[0] || null;
}
