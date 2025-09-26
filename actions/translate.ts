"use server";

export interface TranslateRequest {
  text: string;
  targetLanguages: string[];
  sourceLanguage: string;
}

export interface TranslateResponse {
  [key: string]: string;
}

export async function translateText({
  text,
  targetLanguages,
  sourceLanguage,
}: TranslateRequest): Promise<TranslateResponse> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error("DeepL API key not configured");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("Text to translate cannot be empty");
  }

  if (!targetLanguages || targetLanguages.length === 0) {
    throw new Error("At least one target language is required");
  }

  const translations: TranslateResponse = {};

  try {
    // Translate to each target language
    const translationPromises = targetLanguages.map(async (targetLang) => {
      const deeplSourceLang = sourceLanguage;
      const deeplTargetLang = targetLang;

      if (!deeplSourceLang || !deeplTargetLang) {
        console.warn(
          `Language mapping not found for ${sourceLanguage} -> ${targetLang}`
        );
        return { targetLang, translation: null };
      }

      try {
        const response = await fetch(
          "https://api-free.deepl.com/v2/translate",
          {
            method: "POST",
            headers: {
              Authorization: `DeepL-Auth-Key ${apiKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              text: text.trim(),
              source_lang: deeplSourceLang,
              target_lang: deeplTargetLang,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `DeepL API error for ${targetLang}: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();

        if (result.translations && result.translations.length > 0) {
          return { targetLang, translation: result.translations[0].text };
        } else {
          throw new Error(`No translation returned for ${targetLang}`);
        }
      } catch (error) {
        console.error(`Translation failed for ${targetLang}:`, error);
        return { targetLang, translation: null };
      }
    });

    // Wait for all translations to complete
    const results = await Promise.all(translationPromises);

    // Process results
    let successCount = 0;
    for (const result of results) {
      if (result.translation) {
        translations[result.targetLang] = result.translation;
        successCount++;
      }
    }

    if (successCount === 0) {
      throw new Error(
        "All translations failed. Please check your API key and try again."
      );
    }

    return translations;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Translation failed"
    );
  }
}
