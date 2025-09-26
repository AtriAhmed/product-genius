"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import LanguageSelector from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface Translation {
  locale: string;
  title: string;
  description: string;
}

interface MultiLanguageFormProps {
  value: Translation[];
  onChange: (translations: Translation[]) => void;
  supportedLanguages?: { code: string; name: string; countryCode: string }[];
  requiredLanguages?: string[];
  className?: string;
}

const defaultLanguages = [
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

export default function MultiLanguageForm({
  value = [],
  onChange,
  supportedLanguages = defaultLanguages,
  requiredLanguages = [],
  className,
}: MultiLanguageFormProps) {
  const [activeTab, setActiveTab] = useState<string>(value[0]?.locale || "en");
  const t = useTranslations("products");

  // Update activeTab when value changes (for edit mode)
  React.useEffect(() => {
    if (value.length > 0 && !value.find((t) => t.locale === activeTab)) {
      setActiveTab(value[0].locale);
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
    field: keyof Translation,
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

  const getCurrentTranslation = () => {
    return (
      value.find((t) => t.locale === activeTab) || {
        locale: activeTab,
        title: "",
        description: "",
      }
    );
  };

  const getLanguageInfo = (code: string) => {
    return (
      supportedLanguages.find((lang) => lang.code === code) || {
        code,
        name: code.toUpperCase(),
        countryCode: "UN",
      }
    );
  };

  const isRequired = (languageCode: string) => {
    return requiredLanguages.includes(languageCode);
  };

  const hasErrors = (translation: Translation) => {
    return !translation.title.trim() || !translation.description.trim();
  };

  const hasLanguageErrors = (languageCode: string) => {
    const translation = value.find((t) => t.locale === languageCode);
    return translation ? hasErrors(translation) : true;
  };

  // Ensure required languages are present
  React.useEffect(() => {
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

  const selectedLanguages = value.map((t) => t.locale);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Language Selector */}
      <LanguageSelector
        selectedLanguages={selectedLanguages}
        availableLanguages={supportedLanguages}
        onLanguageAdd={addLanguage}
        onLanguageRemove={removeLanguage}
        onLanguageSelect={setActiveTab}
        activeLanguage={activeTab}
        requiredLanguages={requiredLanguages}
        hasErrors={hasLanguageErrors}
      />

      {/* Translation Form */}
      {value.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <img
              src={`https://flagsapi.com/${
                getLanguageInfo(activeTab).countryCode
              }/flat/24.png`}
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
            const currentTranslation = getCurrentTranslation();

            return (
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
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
                      !currentTranslation.title.trim() && "border-destructive"
                    )}
                  />
                  {!currentTranslation.title.trim() && (
                    <p className="text-sm text-destructive">
                      Title is required
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
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
                      !currentTranslation.description.trim() &&
                        "border-destructive"
                    )}
                  />
                  {!currentTranslation.description.trim() && (
                    <p className="text-sm text-destructive">
                      Description is required
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        <p>
          {value.length} language{value.length !== 1 ? "s" : ""} configured
          {requiredLanguages.length > 0 && (
            <span> • {requiredLanguages.length} required</span>
          )}
        </p>
        {value.some((t) => hasErrors(t)) && (
          <p className="text-destructive mt-1">
            ⚠️ Some translations are incomplete
          </p>
        )}
      </div>
    </div>
  );
}
