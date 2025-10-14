"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface LanguageOption {
  code: string;
  name: string;
  countryCode: string; // For the flag API
}

interface LanguageSelectorProps {
  selectedLanguages: string[];
  availableLanguages?: LanguageOption[];
  onLanguageAdd: (languageCode: string) => void;
  onLanguageRemove: (languageCode: string) => void;
  onLanguageSelect: (languageCode: string) => void;
  activeLanguage: string;
  requiredLanguages?: string[];
  hasErrors?: (languageCode: string) => boolean;
  className?: string;
  // New prop for translation button
  translationButton?: React.ReactNode;
}

const defaultLanguages: LanguageOption[] = [
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

export default function LanguageSelector({
  selectedLanguages,
  availableLanguages = defaultLanguages,
  onLanguageAdd,
  onLanguageRemove,
  onLanguageSelect,
  activeLanguage,
  requiredLanguages = [],
  hasErrors,
  className,
  translationButton,
}: LanguageSelectorProps) {
  const t = useTranslations("categories");

  const getLanguageInfo = (code: string) => {
    return (
      availableLanguages.find((lang) => lang.code === code) || {
        code,
        name: code.toUpperCase(),
        countryCode: "UN", // Default flag
      }
    );
  };

  const getAvailableLanguages = () => {
    return availableLanguages.filter(
      (lang) => !selectedLanguages.includes(lang.code)
    );
  };

  const isRequired = (languageCode: string) => {
    return requiredLanguages.includes(languageCode);
  };

  const handleLanguageAdd = (languageCode: string) => {
    onLanguageAdd(languageCode);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Language Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((languageCode) => {
            const langInfo = getLanguageInfo(languageCode);
            const hasError = hasErrors ? hasErrors(languageCode) : false;

            return (
              <div key={languageCode} className="relative group">
                <Button
                  type="button"
                  variant={
                    activeLanguage === languageCode ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onLanguageSelect(languageCode)}
                  className={cn(
                    "h-9 px-3 gap-2 transition-colors",
                    hasError && "border-destructive text-destructive",
                    activeLanguage === languageCode &&
                      hasError &&
                      "bg-destructive text-destructive-foreground"
                  )}
                >
                  <img
                    src={`https://flagsapi.com/${langInfo.countryCode}/flat/24.png`}
                    alt={`${langInfo.name} flag`}
                    className="w-4 h-3 object-cover rounded-sm"
                  />
                  <span className="text-sm">{t(langInfo.name)}</span>
                  {isRequired(languageCode) && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      Required
                    </Badge>
                  )}
                </Button>

                {!isRequired(languageCode) && (
                  <button
                    type="button"
                    onClick={() => onLanguageRemove(languageCode)}
                    className="absolute -top-1 -right-1 size-4 rounded-full bg-foreground hover:bg-muted-foreground hover opacity-0 group-hover:opacity-100 duration-200"
                  >
                    <X className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 size-2.5 text-background " />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Language Dropdown */}
        {getAvailableLanguages().length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Plus className="w-4 h-4" />
                Add Language
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {getAvailableLanguages().map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => handleLanguageAdd(language.code)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://flagsapi.com/${language.countryCode}/flat/24.png`}
                      alt={`${language.name} flag`}
                      className="w-4 h-3 object-cover rounded-sm"
                    />
                    <span>{t(language.name)}</span>
                    <span className="text-muted-foreground">
                      ({language.code})
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Translation Button */}
        {translationButton}
      </div>
    </div>
  );
}
