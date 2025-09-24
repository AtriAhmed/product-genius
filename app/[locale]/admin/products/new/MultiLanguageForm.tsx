"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Translation {
  locale: string;
  title: string;
  description: string;
}

interface MultiLanguageFormProps {
  value: Translation[];
  onChange: (translations: Translation[]) => void;
  supportedLanguages?: { code: string; name: string; flag: string }[];
  requiredLanguages?: string[];
  className?: string;
}

const defaultLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export default function MultiLanguageForm({
  value = [],
  onChange,
  supportedLanguages = defaultLanguages,
  requiredLanguages = ["en"],
  className,
}: MultiLanguageFormProps) {
  const [activeTab, setActiveTab] = useState<string>(
    value[0]?.locale || requiredLanguages[0] || "en"
  );
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const addLanguage = (languageCode: string) => {
    if (value.some(t => t.locale === languageCode)) return;

    const newTranslation: Translation = {
      locale: languageCode,
      title: '',
      description: '',
    };

    onChange([...value, newTranslation]);
    setActiveTab(languageCode);
    setShowLanguageDropdown(false);
  };

  const removeLanguage = (languageCode: string) => {
    // Don't remove required languages
    if (requiredLanguages.includes(languageCode)) return;
    
    const newTranslations = value.filter(t => t.locale !== languageCode);
    onChange(newTranslations);
    
    // Switch to first available tab
    if (activeTab === languageCode) {
      setActiveTab(newTranslations[0]?.locale || requiredLanguages[0] || 'en');
    }
  };

  const updateTranslation = (locale: string, field: keyof Translation, fieldValue: string) => {
    const newTranslations = value.map(translation => {
      if (translation.locale === locale) {
        return { ...translation, [field]: fieldValue };
      }
      return translation;
    });

    onChange(newTranslations);
  };

  const getAvailableLanguages = () => {
    const usedLanguages = value.map(t => t.locale);
    return supportedLanguages.filter(lang => !usedLanguages.includes(lang.code));
  };

  const getCurrentTranslation = () => {
    return value.find(t => t.locale === activeTab) || {
      locale: activeTab,
      title: '',
      description: '',
    };
  };

  const getLanguageInfo = (code: string) => {
    return supportedLanguages.find(lang => lang.code === code) || {
      code,
      name: code.toUpperCase(),
      flag: '🌐',
    };
  };

  const isRequired = (languageCode: string) => {
    return requiredLanguages.includes(languageCode);
  };

  const hasErrors = (translation: Translation) => {
    return !translation.title.trim() || !translation.description.trim();
  };

  // Ensure required languages are present
  React.useEffect(() => {
    const missingRequired = requiredLanguages.filter(
      lang => !value.some(t => t.locale === lang)
    );

    if (missingRequired.length > 0) {
      const newTranslations = [
        ...value,
        ...missingRequired.map(locale => ({
          locale,
          title: '',
          description: '',
        })),
      ];
      onChange(newTranslations);
    }
  }, [requiredLanguages, value, onChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Language Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Globe className="w-4 h-4" />
          Languages:
        </div>
        
        <div className="flex flex-wrap gap-2">
          {value.map((translation) => {
            const langInfo = getLanguageInfo(translation.locale);
            const hasError = hasErrors(translation);
            
            return (
              <div key={translation.locale} className="relative">
                <Button
                  type="button"
                  variant={activeTab === translation.locale ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(translation.locale)}
                  className={cn(
                    "h-8 px-3 gap-2",
                    hasError && "border-destructive text-destructive",
                    activeTab === translation.locale && hasError && "bg-destructive text-destructive-foreground"
                  )}
                >
                  <span>{langInfo.flag}</span>
                  <span>{langInfo.name}</span>
                  {isRequired(translation.locale) && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      Required
                    </Badge>
                  )}
                </Button>
                
                {!isRequired(translation.locale) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(translation.locale)}
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Language Dropdown */}
        {getAvailableLanguages().length > 0 && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-2"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Plus className="w-4 h-4" />
              Add Language
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            {showLanguageDropdown && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]">
                <div className="py-1">
                  {getAvailableLanguages().map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => addLanguage(language.code)}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                      <span className="text-gray-500">({language.code})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Translation Form */}
      {value.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <span>{getLanguageInfo(activeTab).flag}</span>
              <span>{getLanguageInfo(activeTab).name} Content</span>
              {isRequired(activeTab) && (
                <Badge variant="secondary">Required</Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {(() => {
              const currentTranslation = getCurrentTranslation();
              
              return (
                <>
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={currentTranslation.title}
                      onChange={(e) => updateTranslation(activeTab, 'title', e.target.value)}
                      placeholder={`Enter product title in ${getLanguageInfo(activeTab).name}`}
                      className={cn(
                        !currentTranslation.title.trim() && "border-destructive"
                      )}
                    />
                    {!currentTranslation.title.trim() && (
                      <p className="text-sm text-destructive">Title is required</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={currentTranslation.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateTranslation(activeTab, 'description', e.target.value)}
                      placeholder={`Enter product description in ${getLanguageInfo(activeTab).name}`}
                      rows={4}
                      className={cn(
                        !currentTranslation.description.trim() && "border-destructive"
                      )}
                    />
                    {!currentTranslation.description.trim() && (
                      <p className="text-sm text-destructive">Description is required</p>
                    )}
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        <p>
          {value.length} language{value.length !== 1 ? 's' : ''} configured
          {requiredLanguages.length > 0 && (
            <span> • {requiredLanguages.length} required</span>
          )}
        </p>
        {value.some(t => hasErrors(t)) && (
          <p className="text-destructive mt-1">
            ⚠️ Some translations are incomplete
          </p>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showLanguageDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </div>
  );
}