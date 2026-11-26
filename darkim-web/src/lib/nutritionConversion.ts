/**
 * Supported units for serving size dropdowns across DARKIM forms.
 */
export const SERVING_SIZE_UNITS = [
  { value: 'ml', label: 'ml (Mililiter)' },
  { value: 'g', label: 'g (Gram)' },
  { value: 'l', label: 'l (Liter)' },
  { value: 'kg', label: 'kg (Kilogram)' },
  { value: 'mg', label: 'mg (Miligram)' },
] as const;

export type ServingSizeUnit = (typeof SERVING_SIZE_UNITS)[number]['value'];

/**
 * Parse a serving size string like "250 ml" or "1 botol (200ml)" into { amount, unit }.
 */
export function splitServingSize(servingSize?: string | null): {
  amount: string;
  unit: ServingSizeUnit;
} {
  const text = (servingSize || '').trim();
  if (!text) return { amount: '100', unit: 'ml' };

  const unitMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(ml|mg|kg|gr|gram|liter|g|l)\b/i);
  if (unitMatch) {
    const amount = unitMatch[1].replace(',', '.');
    const rawUnit = unitMatch[2].toLowerCase();
    let unit: ServingSizeUnit = 'ml';
    if (rawUnit === 'g' || rawUnit === 'gr' || rawUnit === 'gram') unit = 'g';
    else if (rawUnit === 'l' || rawUnit === 'liter') unit = 'l';
    else if (rawUnit === 'kg') unit = 'kg';
    else if (rawUnit === 'mg') unit = 'mg';
    else unit = 'ml';
    return { amount, unit };
  }

  const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  return {
    amount: numMatch ? numMatch[1].replace(',', '.') : '100',
    unit: 'ml',
  };
}

/**
 * Parse numeric quantity normalized to base grams or milliliters (g / ml).
 */
export function parseServingQuantity(servingSize?: string | null): number | null {
  if (!servingSize) return null;
  const text = servingSize.trim().toLowerCase();
  if (!text) return null;

  const unitMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(ml|mg|kg|gr|gram|liter|g|l)\b/i);
  if (unitMatch) {
    const rawNum = parseFloat(unitMatch[1].replace(',', '.'));
    if (isNaN(rawNum) || rawNum <= 0) return null;
    const unit = unitMatch[2].toLowerCase();
    if (unit === 'l' || unit === 'liter' || unit === 'kg') return rawNum * 1000;
    if (unit === 'mg') return rawNum / 1000;
    return rawNum;
  }

  const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) {
    const rawNum = parseFloat(numMatch[1].replace(',', '.'));
    return !isNaN(rawNum) && rawNum > 0 ? rawNum : null;
  }

  return null;
}

/**
 * Compute conversion factor from "per servingSize" to OpenFoodFacts canonical "per 100g / 100ml".
 */
export function getPer100ConversionFactor(servingSize?: string | null): {
  servingAmount: number | null;
  factor: number;
  isScaled: boolean;
} {
  const servingAmount = parseServingQuantity(servingSize);
  if (!servingAmount || servingAmount <= 0) {
    return { servingAmount: null, factor: 1, isScaled: false };
  }
  const factor = 100 / servingAmount;
  return {
    servingAmount,
    factor,
    isScaled: Math.abs(servingAmount - 100) > 0.001,
  };
}

/**
 * Safely parse an optional numeric value while preserving zero (0).
 * Empty strings, null, undefined, and NaN return undefined.
 */
export function toOptionalNumber(val: unknown): number | undefined {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  if (!str) return undefined;
  const num = Number(str);
  return isNaN(num) ? undefined : num;
}

/**
 * Convert a single nutrient value entered for `servingSize` into per-100g/100ml basis.
 */
export function scaleNutrientToPer100(
  val: number | null | undefined,
  factor: number,
  decimals = 2
): number | undefined {
  if (val === undefined || val === null || isNaN(val)) return undefined;
  return Number((val * factor).toFixed(decimals));
}
