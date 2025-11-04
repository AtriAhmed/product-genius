import { z } from "zod";

// Form validation schemas
export const planFeatureSchema = z.object({
  key: z.string().min(1, "Feature key is required"),
  value: z.string().optional(),
  description: z.string().optional(),
  included: z.boolean(),
  note: z.string().optional(),
});

export const planPriceSchema = z.object({
  interval: z.enum(["DAY", "WEEK", "MONTH", "YEAR"] as const),
  price: z.number().optional().nullable(),
  compareAtPrice: z.number().optional().nullable(),
});

export const planFormSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  active: z.boolean(),
  features: z.array(planFeatureSchema).optional(),
  mostPopular: z.boolean(),
  sortOrder: z.number().min(0),
  // manual prices check: at least one price should have a value
  prices: z
    .array(planPriceSchema)
    .refine(
      (prices) =>
        prices.some(
          (price) => price.price !== undefined && price.price !== null
        ),
      {
        message: "At least one price must have a value",
      }
    ),
});

export type PlanFormData = z.infer<typeof planFormSchema>;
