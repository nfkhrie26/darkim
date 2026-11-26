export interface CatalogCategoryOption {
  value: string;
  label: string;
  shortLabel: string;
}

export const CATALOG_CATEGORY_OPTIONS: CatalogCategoryOption[] = [
  { value: 'all', label: 'Semua Kategori', shortLabel: 'Semua Kategori' },
  { value: 'makanan', label: 'Makanan (Semua)', shortLabel: 'Makanan' },
  { value: 'minuman', label: 'Minuman', shortLabel: 'Minuman' },
  { value: 'snack', label: 'Camilan & Snack', shortLabel: 'Camilan' },
  { value: 'susu-olahan', label: 'Susu & Olahan Susu', shortLabel: 'Susu/Olahan' },
  { value: 'mie-pasta', label: 'Mie & Pasta', shortLabel: 'Mie/Pasta' },
  { value: 'biskuit-kue', label: 'Biskuit & Kue', shortLabel: 'Biskuit' },
  { value: 'saus-bumbu', label: 'Saus & Bumbu Dapur', shortLabel: 'Saus/Bumbu' },
  { value: 'cokelat-permen', label: 'Cokelat & Permen', shortLabel: 'Cokelat' },
  { value: 'sereal', label: 'Sereal & Biji-bijian', shortLabel: 'Sereal' },
];

export const CATEGORY_LABELS_MAP: Record<string, string> = Object.fromEntries(
  CATALOG_CATEGORY_OPTIONS.map((c) => [c.value, c.label])
);
