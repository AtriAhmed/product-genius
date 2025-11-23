import { formatCurrency } from "@/lib/utils";
import { nanoid } from "nanoid";
import { ProductVariant as FullProductVariant } from "@/types";

export type ID = string | number;

export type OptionValue = {
  id: ID;
  value: string;
  position: number;
};

export type ProductOption = {
  id: ID;
  name: string;
  position: number;
  values: OptionValue[];
};

export type ProductVariant = {
  id: ID;
  options: Record<ID, ID>; // optionId -> valueId
  price?: number | null;
};

export const tempId = () => `temp_${nanoid(8)}`;

/**
 * Normalize array positions to 0..n-1
 */
function normalizePositions<T extends { position: number }>(arr: T[]): T[] {
  return arr.map((item, index) => ({ ...item, position: index }));
}

/**
 * Add new option
 */
export function addOption(options: ProductOption[], name: string): ProductOption[] {
  const newOption: ProductOption = {
    id: tempId(),
    name,
    position: options.length,
    values: [],
  };

  return [...options, newOption];
}

/**
 * Rename option
 */
export function renameOption(options: ProductOption[], optionId: ID, newName: string): ProductOption[] {
  return options.map((opt) => (opt.id === optionId ? { ...opt, name: newName } : opt));
}

/**
 * Add value to option
 */
export function addOptionValue(options: ProductOption[], optionId: ID, value: string): ProductOption[] {
  return options.map((option) =>
    option.id === optionId
      ? {
          ...option,
          values: normalizePositions([...option.values, { id: tempId(), value, position: option.values.length }]),
        }
      : option
  );
}

/**
 * Rename a value (ID stays same = variants preserved)
 */
export function renameOptionValue(
  options: ProductOption[],
  optionId: ID,
  valueId: ID,
  newValue: string
): ProductOption[] {
  return options.map((option) =>
    option.id === optionId
      ? {
          ...option,
          values: option.values.map((v) => (v.id === valueId ? { ...v, value: newValue } : v)),
        }
      : option
  );
}

/**
 * Reorder options by swapping positions
 */
export function reorderOptions(
  options: ProductOption[],
  sourceIndex: number,
  destinationIndex: number
): ProductOption[] {
  return options.map((option, index) => {
    if (index === sourceIndex) {
      return { ...option, position: destinationIndex };
    }
    if (index === destinationIndex) {
      return { ...option, position: sourceIndex };
    }
    return option;
  });
}

/**
 * Reorder values inside an option
 */
export function reorderOptionValues(
  options: ProductOption[],
  optionId: ID,
  sourceIndex: number,
  destinationIndex: number
): ProductOption[] {
  return options.map((option) =>
    option.id === optionId
      ? {
          ...option,
          values: normalizePositions(move(option.values, sourceIndex, destinationIndex)),
        }
      : option
  );
}

function move<T>(arr: T[], from: number, to: number): T[] {
  //   const newArr = [...arr];
  //   const [item] = newArr.splice(from, 1);
  //   newArr.splice(to, 0, item);
  // without using splice
  const newArr = arr.slice();
  const item = newArr[from];
  if (from < to) {
    for (let i = from; i < to; i++) {
      newArr[i] = newArr[i + 1];
    }
    newArr[to] = item;
  } else if (from > to) {
    for (let i = from; i > to; i--) {
      newArr[i] = newArr[i - 1];
    }
    newArr[to] = item;
  }
  return newArr;
}

/**
 * Generate variants (preserves variants when IDs match)
 */
export function generateVariants(options: ProductOption[], existingVariants: ProductVariant[]): ProductVariant[] {
  if (options.length === 0 || options.some((o) => o.values.length === 0)) return [];

  const combinations = cartesian(
    ...options.map((option) =>
      option.values.map((value) => ({
        optionId: option.id,
        valueId: value.id,
      }))
    )
  );

  return combinations.map((combo) => {
    const optionMap = Object.fromEntries(combo.map((c) => [c.optionId, c.valueId]));

    console.log("-------------------- optionMap --------------------");
    console.log(optionMap);

    console.log("-------------------- existingVariants --------------------");
    console.log(existingVariants);

    const existing = existingVariants.find((v) =>
      Object.keys(optionMap).every((key) => v.options[key] === optionMap[key])
    );

    console.log("-------------------- existing --------------------");
    console.log(existing);

    return existing ?? { id: tempId(), options: optionMap, price: 1 };
  });
}

function cartesian<T>(...arrays: T[][]): T[][] {
  return arrays.reduce((acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])), [[]] as T[][]);
}

export function getProductPrices(variants: FullProductVariant[]) {
  const variantPrices = variants?.map((v) => v.price!).filter((p) => p > 0);
  const minPrice = variantPrices?.length ? Math.min(...variantPrices) : undefined;
  const maxPrice = variantPrices?.length ? Math.max(...variantPrices) : undefined;
  const formattedPrice =
    minPrice === undefined || maxPrice === undefined
      ? null
      : minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} -- ${formatCurrency(maxPrice)}`;

  return { formattedPrice, minPrice, maxPrice };
}
