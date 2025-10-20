"use client";

/* removed Switch import */
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

/* Select imports (used by DropdownSelect) */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export type Option = { value: string; label: string };

export function DropdownSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
}: {
  id?: string;
  value?: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  const label =
    options.find((o) => o.value === value)?.label ??
    (value ? value : placeholder);

  return (
    <Select value={value ?? ""} onValueChange={(v) => onValueChange(v)}>
      <SelectTrigger id={id} className={className || "w-full"}>
        {label}
      </SelectTrigger>
      <SelectContent>
        {options.length ? (
          options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="">No options</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
