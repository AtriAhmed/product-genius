"use client";

import TranslationDropdown from "@/app/[locale]/admin/products/TranslationDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProductTranslation } from "@/types";
import { LANGUAGES } from "@/types/constants";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageAdd: (languageCode: string) => void;
  onLanguageRemove: (languageCode: string) => void;
  onLanguageSelect: (languageCode: string) => void;
  activeLanguage: string;
  requiredLanguages?: string[];
  hasErrors?: (languageCode: string) => boolean;
  className?: string;
  currentTranslation: ProductTranslation | null;
  handleAutoTranslate: (translations: {
    [key: string]: { title: string; description: string };
  }) => void;
}

export default function LanguageSelector({
  selectedLanguages,
  onLanguageAdd,
  onLanguageRemove,
  onLanguageSelect,
  activeLanguage,
  requiredLanguages = [],
  hasErrors,
  className,
  currentTranslation,
  handleAutoTranslate,
}: LanguageSelectorProps) {
  const t = useTranslations("categories");

  const getLanguageInfo = (code: string) => {
    return (
      LANGUAGES.find((lang) => lang.code === code) || {
        code,
        name: code.toUpperCase(),
        countryCode: "UN", // Default flag
      }
    );
  };

  const getAvailableLanguages = () => {
    return LANGUAGES.filter((lang) => !selectedLanguages.includes(lang.code));
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
              <div key={languageCode} className="group relative">
                <Button
                  type="button"
                  variant={
                    activeLanguage === languageCode ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onLanguageSelect(languageCode)}
                  className={cn(
                    "gap-2 h-9 px-3 transition-colors",
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
                    className="-top-1 -right-1 absolute size-4 rounded-full bg-foreground hover:bg-muted-foreground opacity-0 focus:opacity-100 group-hover:opacity-100 duration-200 hover"
                  >
                    <X className="top-1/2 left-1/2 absolute size-2.5 text-background -translate-x-1/2 -translate-y-1/2" />
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
              <Button variant="outline" size="sm" className="gap-2 h-9">
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

        <TranslationDropdown
          selectedLanguages={selectedLanguages}
          activeLanguage={activeLanguage}
          currentTranslation={currentTranslation}
          onTranslate={handleAutoTranslate}
        />
      </div>
    </div>
  );
}
