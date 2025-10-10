"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { translateText } from "@/actions/translate";
import { toast } from "sonner";

interface TranslationDropdownProps {
  availableLanguages: { code: string; name: string; countryCode: string }[];
  selectedLanguages: string[];
  activeLanguage: string;
  currentTranslation: {
    title: string;
    description: string;
  };
  onTranslate: (translations: {
    [key: string]: { title: string; description: string };
  }) => void;
  className?: string;
}

export default function TranslationDropdown({
  availableLanguages,
  selectedLanguages,
  activeLanguage,
  currentTranslation,
  onTranslate,
  className,
}: TranslationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<
    string[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const t = useTranslations("products");

  // Get languages that can be translated to (exclude active language)
  const availableTargetLanguages = availableLanguages.filter(
    (lang) => lang.code !== activeLanguage
  );

  const toggleLanguageSelection = (languageCode: string) => {
    setSelectedTargetLanguages((prev) =>
      prev.includes(languageCode)
        ? prev.filter((code) => code !== languageCode)
        : [...prev, languageCode]
    );
  };

  const handleTranslate = async () => {
    if (selectedTargetLanguages.length === 0) {
      toast.error("Please select at least one target language");
      return;
    }

    const trimmedTitle = currentTranslation.title.trim();
    const trimmedDescription = currentTranslation.description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      toast.error(
        "Please fill in the title and description for the current language before translating"
      );
      return;
    }

    setIsTranslating(true);

    try {
      // Translate title and description separately
      const [titleTranslations, descriptionTranslations] = await Promise.all([
        translateText({
          text: trimmedTitle,
          targetLanguages: selectedTargetLanguages,
          sourceLanguage: activeLanguage,
        }),
        translateText({
          text: trimmedDescription,
          targetLanguages: selectedTargetLanguages,
          sourceLanguage: activeLanguage,
        }),
      ]);

      // Combine translations
      const combinedTranslations: {
        [key: string]: { title: string; description: string };
      } = {};

      for (const langCode of selectedTargetLanguages) {
        combinedTranslations[langCode] = {
          title: titleTranslations[langCode] || "",
          description: descriptionTranslations[langCode] || "",
        };
      }

      onTranslate(combinedTranslations);

      const successCount = Object.keys(combinedTranslations).length;
      toast.success(
        `Successfully translated to ${successCount} language${
          successCount > 1 ? "s" : ""
        }`
      );

      // Reset selections and close dropdown
      setSelectedTargetLanguages([]);
      setOpen(false);
    } catch (error) {
      console.error("Translation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Translation failed";
      toast.error(`Translation failed: ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string) => {
    const lang = availableLanguages.find((l) => l.code === code);
    return lang ? t(lang.name) : code.toUpperCase();
  };

  const getLanguageInfo = (code: string) => {
    return availableLanguages.find((lang) => lang.code === code);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-9 gap-2", className)}
          disabled={
            !currentTranslation.title.trim() ||
            !currentTranslation.description.trim()
          }
        >
          <Languages className="h-4 w-4" />
          Auto translate from {getLanguageName(activeLanguage)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search languages..."
            className="border-0 no-ring"
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No languages found.</CommandEmpty>
            <CommandGroup>
              {availableTargetLanguages.map((language) => {
                const isSelected = selectedTargetLanguages.includes(
                  language.code
                );
                const langInfo = getLanguageInfo(language.code);

                return (
                  <CommandItem
                    key={language.code}
                    value={`${language.name} ${language.code}`}
                    onSelect={() => toggleLanguageSelection(language.code)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {langInfo && (
                        <img
                          src={`https://flagsapi.com/${langInfo.countryCode}/flat/24.png`}
                          alt={`${language.code} flag`}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                      )}
                      <span>{getLanguageName(language.code)}</span>
                      {selectedLanguages.includes(language.code) && (
                        <Badge variant="secondary" className="text-xs">
                          Configured
                        </Badge>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {/* Translation Controls */}
          <div className="flex items-center justify-between p-3 border-t bg-muted/50">
            <div className="text-sm text-muted-foreground">
              {selectedTargetLanguages.length} language
              {selectedTargetLanguages.length !== 1 ? "s" : ""} selected
            </div>
            <Button
              onClick={handleTranslate}
              disabled={selectedTargetLanguages.length === 0 || isTranslating}
              size="sm"
              className="gap-2"
            >
              {isTranslating && <Loader2 className="h-3 w-3 animate-spin" />}
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
