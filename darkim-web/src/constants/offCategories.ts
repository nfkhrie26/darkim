export interface OffCategoryOption {
  value: string;
  label: string;
}

/**
 * Curated official Open Food Facts taxonomy categories relevant to Indonesian & imported packaged products.
 * Values use standard English OpenFoodFacts category labels for clean server indexing.
 */
export const OFF_CATEGORIES: OffCategoryOption[] = [
  { value: 'Beverages', label: 'Minuman (Beverages)' },
  { value: 'Dairies', label: 'Susu & Olahan Susu (Dairies)' },
  { value: 'Waters', label: 'Air Mineral (Waters)' },
  { value: 'Teas', label: 'Teh (Teas)' },
  { value: 'Coffees', label: 'Kopi (Coffees)' },
  { value: 'Snacks', label: 'Camilan / Makanan Ringan (Snacks)' },
  { value: 'Sweet snacks', label: 'Camilan Manis (Sweet Snacks)' },
  { value: 'Salty snacks', label: 'Camilan Gurih (Salty Snacks)' },
  { value: 'Biscuits and cakes', label: 'Biskuit & Kue (Biscuits & Cakes)' },
  { value: 'Chocolates', label: 'Cokelat & Permen (Chocolates)' },
  { value: 'Instant noodles', label: 'Mie Instan & Pasta (Instant Noodles)' },
  { value: 'Cereals and potatoes', label: 'Sereal, Roti & Biji-bijian (Cereals & Potatoes)' },
  { value: 'Plant-based foods', label: 'Makanan Berbasis Nabati (Plant-based Foods)' },
  { value: 'Meats', label: 'Daging & Olahan Daging (Meats)' },
  { value: 'Seafood', label: 'Ikan & Makanan Laut (Seafood)' },
  { value: 'Condiments', label: 'Bumbu & Saus (Condiments & Sauces)' },
  { value: 'Meals', label: 'Makanan Siap Saji (Meals)' },
  { value: 'Frozen foods', label: 'Makanan Beku (Frozen Foods)' },
  { value: 'Breakfasts', label: 'Sarapan & Selai (Breakfasts)' },
];

export function isValidOffCategory(val?: string | null): boolean {
  if (!val) return false;
  return OFF_CATEGORIES.some((c) => c.value === val);
}
