import { MARKETPLACES } from "@/types";
import z from "zod";

export const supplierSchema = z.object({
  tempId: z.string().optional(),
  url: z.url("Invalid URL").optional().or(z.literal("")),
  marketplace: z.enum(MARKETPLACES).optional().or(z.literal("")),
  price: z.number().optional().nullable(),
  currency: z.string().optional(),
  isInternal: z.boolean(),
  notes: z.string().optional(),
});

// Form validation schema
export const productFormSchema = z.object({
  suggestedPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean(),
  translations: z
    .array(
      z.object({
        locale: z.string().min(1),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
      })
    )
    .min(1, "At least one translation is required"),
  media: z.array(z.any()),
  suppliers: z.array(supplierSchema).optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export type AddSupplierFormData = z.infer<typeof supplierSchema>;
