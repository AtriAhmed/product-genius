"use client";

import LanguageSelector from "@/components/LanguageSelector";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentTranslation } from "@/lib/products";
import { cn } from "@/lib/utils";
import { ProductTranslation } from "@/types";
import { LANGUAGES } from "@/types/constants";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

type Translation = {
  locale: string;
  title: string;
  description: string;
};

interface MultiLanguageFormProps {
  value: Translation[];
  onChange: (translations: Translation[]) => void;
  requiredLanguages?: string[];
  className?: string;
}

export default function MultiLanguageForm({
  value = [],
  onChange,
  requiredLanguages = [],
  className,
}: MultiLanguageFormProps) {
  const [activeTab, setActiveTab] = useState<string>(value[0]?.locale || "en");
  const t = useTranslations("products");

  // Update activeTab when value changes (for edit mode)
  React.useEffect(() => {
    if (value.length > 0 && !value.find((t) => t.locale === activeTab)) {
      setActiveTab(value[0].locale!);
    }
  }, [value, activeTab]);

  const addLanguage = (languageCode: string) => {
    if (value.some((t) => t.locale === languageCode)) return;

    const newTranslation: Translation = {
      locale: languageCode,
      title: "",
      description: "",
    };

    onChange([...value, newTranslation]);
    setActiveTab(languageCode);
  };

  const removeLanguage = (languageCode: string) => {
    // Don't remove required languages
    if (requiredLanguages.includes(languageCode)) return;

    const newTranslations = value.filter((t) => t.locale !== languageCode);
    onChange(newTranslations);

    // Switch to first available tab
    if (activeTab === languageCode) {
      setActiveTab(newTranslations[0]?.locale || "en");
    }
  };

  const updateTranslation = (
    locale: string,
    field: keyof ProductTranslation,
    fieldValue: string
  ) => {
    const newTranslations = value.map((translation) => {
      if (translation.locale === locale) {
        return { ...translation, [field]: fieldValue };
      }
      return translation;
    });

    onChange(newTranslations);
  };

  const getLanguageInfo = (code: string) => {
    return (
      LANGUAGES.find((lang) => lang.code === code) || {
        code,
        name: code.toUpperCase(),
        countryCode: "UN",
      }
    );
  };

  const isRequired = (languageCode: string) => {
    return requiredLanguages.includes(languageCode);
  };

  const hasErrors = (translation: ProductTranslation) => {
    return !translation.title?.trim() || !translation.description?.trim();
  };

  const hasLanguageErrors = (languageCode: string) => {
    const translation = value.find((t) => t.locale === languageCode);
    return translation ? hasErrors(translation) : true;
  };

  // Ensure required languages are present
  useEffect(() => {
    const missingRequired = requiredLanguages.filter(
      (lang) => !value.some((t) => t.locale === lang)
    );

    if (missingRequired.length > 0) {
      const newTranslations = [
        ...value,
        ...missingRequired.map((locale) => ({
          locale,
          title: "",
          description: "",
        })),
      ];
      onChange(newTranslations);
    }
  }, [requiredLanguages, value, onChange]);

  const handleAutoTranslate = (translations: {
    [key: string]: { title: string; description: string };
  }) => {
    const newTranslations = [...value];

    Object.entries(translations).forEach(([locale, translation]) => {
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

    onChange(newTranslations);
  };

  const selectedLanguages = value.map((t) => t.locale || "");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Language Selector with Translation Button */}
      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onLanguageAdd={addLanguage}
        onLanguageRemove={removeLanguage}
        onLanguageSelect={setActiveTab}
        activeLanguage={activeTab}
        requiredLanguages={requiredLanguages}
        hasErrors={hasLanguageErrors}
        currentTranslation={getCurrentTranslation(value, activeTab)}
        handleAutoTranslate={handleAutoTranslate}
      />

      {/* Translation Form */}
      {value.length > 0 && (
        <div className="space-y-3 pt-3 border-border border-t">
          <div className="flex items-center gap-2">
            <img
              src={`https://flagsapi.com/${getLanguageInfo(
                activeTab
              ).code?.toUpperCase()}/flat/24.png`}
              alt={`${activeTab} flag`}
              className="w-4 h-3 object-cover rounded-sm"
            />
            <span className="font-medium">
              {t("{language} content", {
                language: t(getLanguageInfo(activeTab).name),
              })}
            </span>
            {isRequired(activeTab) && (
              <Badge variant="secondary">Required</Badge>
            )}
          </div>

          {(() => {
            const currentTranslation = getCurrentTranslation(value, activeTab);

            return (
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="font-medium text-sm">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={currentTranslation.title}
                    onChange={(e) =>
                      updateTranslation(activeTab, "title", e.target.value)
                    }
                    placeholder={`Enter product title in ${
                      getLanguageInfo(activeTab).name
                    }`}
                    className={cn(
                      !currentTranslation.title?.trim() && "border-destructive"
                    )}
                  />
                  {!currentTranslation.title?.trim() && (
                    <p className="text-destructive text-sm">
                      Title is required
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="font-medium text-sm">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={currentTranslation.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateTranslation(
                        activeTab,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder={`Enter product description in ${
                      getLanguageInfo(activeTab).name
                    }`}
                    rows={4}
                    className={cn(
                      !currentTranslation.description?.trim() &&
                        "border-destructive"
                    )}
                  />
                  {!currentTranslation.description?.trim() && (
                    <p className="text-destructive text-sm">
                      Description is required
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
