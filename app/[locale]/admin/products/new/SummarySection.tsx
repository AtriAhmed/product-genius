"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Translation } from "@/app/[locale]/admin/products/new/MultiLanguageForm";
import { MediaItem } from "@/app/[locale]/admin/products/new/MediaUpload";

interface SummarySectionProps {
  translations: Translation[];
  media: MediaItem[];
  isValid: boolean;
}

export default function SummarySection({
  translations,
  media,
  isValid,
}: SummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Translations:</span>
          <span>{translations.length} languages</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Media files:</span>
          <span>{media.length} items</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Form status:</span>
          <Badge
            variant={isValid ? "default" : "secondary"}
            className="text-xs"
          >
            {isValid ? "Valid" : "Invalid"}
          </Badge>
        </div>
        <Separator />
        <div className="text-xs text-muted-foreground">
          Fill out the required fields to create your product
        </div>
      </CardContent>
    </Card>
  );
}
