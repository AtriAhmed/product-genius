"use client";

import LanguageSelector from "@/components/LanguageSelector";
import CategoryTranslationDropdown from "./CategoryTranslationDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getCurrentTranslation } from "@/lib/products";
import axios from "axios";

interface CategoryTranslation {
  locale: string;
  title: string;
  description: string;
}

interface Category {
  id: number;
  translations: CategoryTranslation[];
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onClose: () => void;
  isOpen: boolean;
  isEmbedded?: boolean;
}

const categoryFormSchema = z.object({
  translations: z
    .array(
      z.object({
        locale: z.string().min(1),
        title: z.string().min(1, "Title is required"),
        description: z.string(),
      })
    )
    .min(1, "At least one translation is required"),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

const languageOptions = [
  { code: "en", name: "english", countryCode: "US" },
  { code: "fr", name: "french", countryCode: "FR" },
  { code: "es", name: "spanish", countryCode: "ES" },
  { code: "de", name: "german", countryCode: "DE" },
  { code: "it", name: "italian", countryCode: "IT" },
  { code: "pt", name: "portuguese", countryCode: "PT" },
  { code: "ru", name: "russian", countryCode: "RU" },
  { code: "ja", name: "japanese", countryCode: "JP" },
  { code: "ko", name: "korean", countryCode: "KR" },
  { code: "zh", name: "chinese", countryCode: "CN" },
];

export default function CategoryForm({
  category,
  onSuccess,
  onClose,
  isOpen,
  isEmbedded = false,
}: CategoryFormProps) {
  const t = useTranslations("categories");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translations, setTranslations] = useState<CategoryTranslation[]>([]);
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [originalTranslations, setOriginalTranslations] = useState<
    CategoryTranslation[]
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      translations: [],
    },
  });

  // Initialize form when category changes
  useEffect(() => {
    if (category) {
      reset({
        translations: category.translations,
      });
      setTranslations(category.translations);
      setOriginalTranslations(category.translations);
      setActiveLanguage(category.translations[0]?.locale || "en");
    } else {
      reset({
        translations: [],
      });
      const initialTranslations = [
        { locale: "en", title: "", description: "" },
      ];
      setTranslations(initialTranslations);
      setOriginalTranslations([]);
      setActiveLanguage("en");
    }
  }, [category, reset]);

  // Update form when translations change
  useEffect(() => {
    setValue("translations", translations, { shouldDirty: true });
  }, [translations, setValue]);

  const selectedLanguages = translations.map((t) => t.locale);

  const handleLanguageAdd = (languageCode: string) => {
    if (translations.some((t) => t.locale === languageCode)) return;

    const newTranslation: CategoryTranslation = {
      locale: languageCode,
      title: "",
      description: "",
    };

    setTranslations([...translations, newTranslation]);
    setActiveLanguage(languageCode);
  };

  const handleLanguageRemove = (languageCode: string) => {
    const newTranslations = translations.filter(
      (t) => t.locale !== languageCode
    );
    setTranslations(newTranslations);

    if (activeLanguage === languageCode) {
      setActiveLanguage(newTranslations[0]?.locale || "en");
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    setActiveLanguage(languageCode);
  };

  const updateTranslation = (
    locale: string,
    field: keyof CategoryTranslation,
    value: string
  ) => {
    setTranslations((prev) =>
      prev.map((translation) => {
        if (translation.locale === locale) {
          return { ...translation, [field]: value };
        }
        return translation;
      })
    );
  };

  const hasErrors = (languageCode: string) => {
    const translationIndex = translations.findIndex(
      (t) => t.locale === languageCode
    );
    return errors.translations?.[translationIndex]?.title !== undefined;
  };

  const handleCancelEdit = () => {
    if (category) {
      // Reset to original values
      setTranslations(originalTranslations);
      setActiveLanguage(originalTranslations[0]?.locale || "en");
      reset({
        translations: originalTranslations,
      });
      // Clear the selected category
      onClose();
    }
  };

  const handleAutoTranslate = (translationsData: {
    [key: string]: { title: string; description: string };
  }) => {
    const newTranslations = [...translations];

    Object.entries(translationsData).forEach(([locale, translation]) => {
      const existingIndex = newTranslations.findIndex(
        (t) => t.locale === locale
      );

      if (existingIndex >= 0) {
        // Update existing translation
        newTranslations[existingIndex] = {
          ...newTranslations[existingIndex],
          title: translation.title,
          description: translation.description,
        };
      } else {
        // Add new translation
        newTranslations.push({
          locale,
          title: translation.title,
          description: translation.description,
        });
      }
    });

    setTranslations(newTranslations);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      const requestData = {
        translations: data.translations.filter((t) => t.title.trim()), // Only include translations with titles
      };

      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories";

      const response = category
        ? await axios.put(url, requestData)
        : await axios.post(url, requestData);

      toast.success(
        t(
          category
            ? "category updated successfully"
            : "category created successfully"
        )
      );

      // Reset form after creating a new category
      if (!category) {
        reset({
          translations: [],
        });
        const initialTranslations = [
          { locale: "en", title: "", description: "" },
        ];
        setTranslations(initialTranslations);
        setActiveLanguage("en");
      }

      onSuccess();
    } catch (error) {
      console.error("Category form error:", error);
      toast.error(
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : t(
              category
                ? "failed to update category"
                : "failed to create category"
            )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const formContent = (
    <form
      id="category-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 space-y-4"
    >
      {/* Language Selector */}
      <div className="flex gap-2">
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onLanguageAdd={handleLanguageAdd}
          onLanguageRemove={handleLanguageRemove}
          onLanguageSelect={handleLanguageSelect}
          activeLanguage={activeLanguage}
          hasErrors={hasErrors}
          currentTranslation={getCurrentTranslation(
            translations,
            activeLanguage
          )}
          handleAutoTranslate={handleAutoTranslate}
        />
      </div>

      {/* Translation Form */}
      {translations.length > 0 && (
        <div className="space-y-3 pt-3 border-border border-t">
          <div className="flex items-center gap-2">
            <img
              src={`https://flagsapi.com/${
                languageOptions.find((l) => l.code === activeLanguage)
                  ?.countryCode || "US"
              }/flat/24.png`}
              alt={`${activeLanguage} flag`}
              className="w-4 h-3 object-cover rounded-sm"
            />
            <span className="font-medium">
              {t("{language} content", {
                language: t(
                  languageOptions.find((l) => l.code === activeLanguage)
                    ?.name || activeLanguage.toUpperCase()
                ),
              })}
            </span>
          </div>

          {(() => {
            const currentTranslation = getCurrentTranslation(
              translations,
              activeLanguage
            );

            return (
              <>
                {/* Title */}
                <div className="space-y-1">
                  <label className="font-medium text-sm">
                    {t("category name")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={currentTranslation.title}
                    onChange={(e) =>
                      updateTranslation(activeLanguage, "title", e.target.value)
                    }
                    placeholder={t("category name placeholder")}
                    className={cn(
                      hasErrors(activeLanguage) && "border-destructive"
                    )}
                  />
                  {(() => {
                    const translationIndex = translations.findIndex(
                      (t) => t.locale === activeLanguage
                    );
                    const error =
                      errors.translations?.[translationIndex]?.title;
                    return (
                      error && (
                        <p className="text-destructive text-sm">
                          {error.message}
                        </p>
                      )
                    );
                  })()}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-medium text-sm">
                    {t("category description")}
                  </label>
                  <Textarea
                    value={currentTranslation.description}
                    onChange={(e) =>
                      updateTranslation(
                        activeLanguage,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder={t("category description placeholder")}
                    rows={2}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Form Errors */}
      {errors.translations && (
        <div className="pt-2 text-destructive text-sm">
          {typeof errors.translations.message === "string"
            ? errors.translations.message
            : "⚠️ Some translations are incomplete"}
        </div>
      )}
    </form>
  );

  if (isEmbedded) {
    return (
      <div className="flex flex-col">
        {formContent}
        <div className="mt-2">
          {category && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              className="w-full mb-2"
            >
              {t("cancel")}
            </Button>
          )}

          <Button
            type="submit"
            form="category-form"
            disabled={isSubmitting && !isDirty}
            className="w-full"
          >
            {isSubmitting
              ? category
                ? "Updating..."
                : "Creating..."
              : category
              ? t("edit")
              : t("create")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-96 sm:max-w-96">
        <SheetHeader className="pb-0">
          <SheetTitle>
            {category ? t("edit category") : t("create category")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-2 py-2">{formContent}</div>

        <SheetFooter className="flex-col gap-2">
          {/* Cancel Edit Button - only show when editing and there are changes */}
          {category && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              className="w-full"
            >
              {t("cancel")}
            </Button>
          )}

          <Button
            type="submit"
            form="category-form"
            disabled={isSubmitting || !isDirty}
            className="w-full"
          >
            {isSubmitting
              ? category
                ? "Updating..."
                : "Creating..."
              : category
              ? t("edit category")
              : t("create category")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
