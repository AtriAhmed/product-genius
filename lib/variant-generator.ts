// lib/variant-generator.ts

export interface OptionDefinition {
  name: string;
  values: string[];
}

export interface GeneratedVariant {
  option1?: string;
  option2?: string;
  option3?: string;
  price: string;
  sku?: string;
}

/**
 * Generate all possible variant combinations from options
 * @example
 * const options = [
 *   { name: 'Color', values: ['Red', 'Blue'] },
 *   { name: 'Size', values: ['S', 'M', 'L'] }
 * ];
 * generateVariantCombinations(options)
 * // Returns: [
 * //   ['Red', 'S'], ['Red', 'M'], ['Red', 'L'],
 * //   ['Blue', 'S'], ['Blue', 'M'], ['Blue', 'L']
 * // ]
 */
export function generateVariantCombinations(
  options: OptionDefinition[]
): string[][] {
  if (options.length === 0) return [[]];
  if (options.length > 3) {
    throw new Error("Shopify supports maximum 3 options per product");
  }

  const valueArrays = options.map((opt) => opt.values);

  function combine(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map((v) => [v]);

    const [first, ...rest] = arrays;
    const restCombinations = combine(rest);

    const result: string[][] = [];
    for (const value of first) {
      for (const combination of restCombinations) {
        result.push([value, ...combination]);
      }
    }

    return result;
  }

  return combine(valueArrays);
}

/**
 * Generate SKU from product code and option values
 * @example
 * generateSku('TSHIRT', ['Red', 'Small'])
 * // Returns: "TSHIRT-RED-SM"
 */
export function generateSku(
  productCode: string,
  optionValues: string[],
  addPrefix: boolean = true
): string {
  const prefix = addPrefix ? "PG-" : "";

  const sanitized = optionValues.map(
    (value) =>
      value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 4) // Take first 4 chars
  );

  return `${prefix}${productCode}-${sanitized.join("-")}`;
}

/**
 * Generate variants with SKUs and pricing
 */
export function generateVariants(
  options: OptionDefinition[],
  basePrice: string,
  productCode?: string,
  generateSkus: boolean = false
): GeneratedVariant[] {
  const combinations = generateVariantCombinations(options);

  return combinations.map((combo) => {
    const variant: GeneratedVariant = {
      price: basePrice,
    };

    // Assign option values
    if (combo[0]) variant.option1 = combo[0];
    if (combo[1]) variant.option2 = combo[1];
    if (combo[2]) variant.option3 = combo[2];

    // Generate SKU if requested
    if (generateSkus && productCode) {
      variant.sku = generateSku(productCode, combo, true);
    }

    return variant;
  });
}

/**
 * Create a simple product with one variant (no options)
 */
export function generateSimpleVariant(
  price: string,
  sku?: string
): GeneratedVariant {
  return {
    price,
    ...(sku && { sku: `PG-${sku}` }),
  };
}

/**
 * Validate variant data before creating
 */
export function validateVariants(
  variants: GeneratedVariant[],
  options: OptionDefinition[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (variants.length === 0) {
    errors.push("At least one variant is required");
  }

  if (variants.length > 100) {
    errors.push("Shopify supports maximum 100 variants per product");
  }

  // Check for duplicate option combinations
  const combinations = new Set<string>();
  variants.forEach((variant, index) => {
    const combo = [variant.option1, variant.option2, variant.option3]
      .filter(Boolean)
      .join("|");

    if (combinations.has(combo)) {
      errors.push(`Duplicate variant at index ${index}: ${combo}`);
    }
    combinations.add(combo);
  });

  // Check if option values match defined options
  if (options.length > 0) {
    variants.forEach((variant, index) => {
      const variantOptions = [
        variant.option1,
        variant.option2,
        variant.option3,
      ].filter(Boolean);

      variantOptions.forEach((value, optIndex) => {
        if (!options[optIndex]) {
          errors.push(
            `Variant ${index} has option${optIndex + 1} but no option defined`
          );
          return;
        }

        if (!options[optIndex].values.includes(value!)) {
          errors.push(
            `Variant ${index}: "${value}" is not in ${options[optIndex].name} values`
          );
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format variants for Shopify API
 */
export function formatVariantsForShopify(
  variants: GeneratedVariant[],
  inventory: number = 0
) {
  return variants.map((variant) => ({
    ...(variant.option1 && { option1: variant.option1 }),
    ...(variant.option2 && { option2: variant.option2 }),
    ...(variant.option3 && { option3: variant.option3 }),
    price: variant.price,
    ...(variant.sku && { sku: variant.sku }),
    inventory_quantity: inventory,
    inventory_management: "shopify",
    fulfillment_service: "manual",
  }));
}
