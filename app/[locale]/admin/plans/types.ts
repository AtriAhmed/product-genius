import { z } from "zod";

// Form validation schemas
export const planFeatureSchema = z.object({
  key: z.string().min(1, "Feature key is required"),
  value: z.string().optional(),
  description: z.string().optional(),
  included: z.boolean(),
  note: z.string().optional(),
});

export const planFormSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  oldPrice: z.number().optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  interval: z.enum(["DAY", "WEEK", "MONTH", "YEAR"] as const),
  active: z.boolean(),
  features: z.array(planFeatureSchema).optional(),
  mostPopular: z.boolean(),
  sortOrder: z.number().min(0),
});

export type PlanFormData = z.infer<typeof planFormSchema>;
