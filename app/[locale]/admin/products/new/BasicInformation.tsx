"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface ProductFormData {
  defaultTitle?: string;
  defaultDescription?: string;
  categoryId?: number;
}

interface BasicInformationProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function BasicInformation({
  register,
  errors,
}: BasicInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Input
            type="number"
            {...register("categoryId", {
              setValueAs: (value) =>
                value === "" ? undefined : parseInt(value),
            })}
            placeholder="Category ID"
          />
          <p className="text-xs text-muted-foreground">
            Product category (optional)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Title</label>
            <Input {...register("defaultTitle")} placeholder="Fallback title" />
            <p className="text-xs text-muted-foreground">
              Used when translation is not available
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Description</label>
            <Input
              {...register("defaultDescription")}
              placeholder="Fallback description"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
