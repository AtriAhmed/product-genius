"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { UseFormRegister } from "react-hook-form";

interface StatusSectionProps {
  register: UseFormRegister<any>;
  defaultValue?: boolean;
}

export default function StatusSection({
  register,
  defaultValue,
}: StatusSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            defaultChecked={defaultValue}
            {...register("isActive")}
            className="rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Product is active
          </label>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Active products are visible to customers
        </p>
      </CardContent>
    </Card>
  );
}
