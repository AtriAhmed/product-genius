"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

interface PricingSectionProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
}

export default function PricingSection({
  register,
  watch,
}: PricingSectionProps) {
  const watchedPrice = watch("suggestedPrice");
  const watchedCurrency = watch("currency");

  const selectedCurrency = currencies.find((c) => c.code === watchedCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Suggested Price</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("suggestedPrice", {
              setValueAs: (value) =>
                value === "" ? undefined : parseFloat(value),
            })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <select
            {...register("currency")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select currency</option>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {watchedPrice && selectedCurrency && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">
              Price Preview: {selectedCurrency.symbol}
              {watchedPrice.toFixed(2)} {selectedCurrency.code}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
