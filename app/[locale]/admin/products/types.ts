import { MARKETPLACES } from "@/types";
import z from "zod";

const idSchema = z.union([z.number(), z.string()]);

export const supplierSchema = z.object({
  id: idSchema.optional(),
  url: z.url().optional().or(z.literal("")).nullable(),
  marketplace: z.enum(MARKETPLACES).optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  isInternal: z.boolean(),
  notes: z.string().optional().nullable(),
});

// ---- NEW: OPTIONS + VALUES with POSITIONS ----
export const productOptionValueSchema = z.object({
  id: idSchema,
  value: z.string().min(1, "Value cannot be empty"),
  position: z.number().int().min(0), // required for ordering
});

export const optionSchema = z.object({
  id: idSchema,
  name: z.string().min(1, "Option name is required"),
  position: z.number().int().min(0), // required for ordering
  values: z
    .array(productOptionValueSchema)
    .min(1, "Option must have at least one value")
    .refine((arr) => {
      // Ensure positions are unique inside the option
      const positions = arr.map((v) => v.position);
      return new Set(positions).size === positions.length;
    }, "Values positions must be unique"),
});

// ---- NEW: VARIANTS ----
export const productVariantSchema = z.object({
  id: idSchema,
  price: z.number().gte(0, "Price must be >= 0").optional().nullable(),
  options: z.record(idSchema, idSchema), // optionId -> valueId
});

// ---- SHIPPING ZONES ----
export const shippingRuleSchema = z.object({
  id: idSchema.optional(),
  name: z.string().optional().nullable(),
  priceCents: z.number().int().min(0, "Price must be >= 0"),
  minQuantity: z.number().int().min(0).optional().nullable(),
  maxQuantity: z.number().int().min(0).optional().nullable(),
});

export const shippingZoneSchema = z.object({
  id: idSchema.optional(),
  name: z.string().optional().nullable(),
  countries: z.array(z.string()).min(1, "At least one country is required"),
  rules: z.array(shippingRuleSchema).min(1, "At least one shipping rule is required"),
});

// ---- MAIN PRODUCT FORM ----
export const productFormSchema = z.object({
  price: z.number().gte(0).optional().nullable(),
  compareAtPrice: z.number().gte(0).optional().nullable(),
  sellingPrice: z.number().gte(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  planIds: z.array(z.number().positive()).default([]),
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

  // ---- NEW ----
  options: z.array(optionSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  shippingZones: z.array(shippingZoneSchema).default([]),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductOptionFormData = z.infer<typeof optionSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type AddSupplierFormData = z.infer<typeof supplierSchema>;
export type ShippingZoneFormData = z.infer<typeof shippingZoneSchema>;
export type ShippingRuleFormData = z.infer<typeof shippingRuleSchema>;
