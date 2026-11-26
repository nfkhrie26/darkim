'use client';

import { OFF_CATEGORIES } from '@/constants/offCategories';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Restricted OpenFoodFacts category dropdown selector (no custom free-text input allowed).
 */
export default function CategorySelect({
  value,
  onChange,
  required = false,
  disabled = false,
  className = 'w-full bg-white brutal-border-sm rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer',
}: CategorySelectProps) {
  return (
    <select
      value={value}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">-- Pilih Kategori Produk --</option>
      {OFF_CATEGORIES.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}
