'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NutritionValues } from '@/components/admin/NutritionInputGrid';

export interface ProductIdentity {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  servingSize: string;
}

export function useProductForm(initial?: Partial<ProductIdentity>) {
  const router = useRouter();

  const [identity, setIdentity] = useState<ProductIdentity>({
    barcode: initial?.barcode || '',
    name: initial?.name || '',
    brand: initial?.brand || '',
    category: initial?.category || 'Makanan & Minuman',
    servingSize: initial?.servingSize || '100 ml',
  });

  const [nutrition, setNutrition] = useState<NutritionValues>({
    energy: '',
    carbohydrates: '',
    sugars: '',
    fat: '',
    saturatedFat: '',
    proteins: '',
    sodium: '',
    fiber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateIdentity = (field: keyof ProductIdentity, value: string) => {
    setIdentity((prev) => ({ ...prev, [field]: value }));
  };

  const updateNutrition = (field: keyof NutritionValues, value: string) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!identity.barcode.trim() || !identity.name.trim()) {
      setErrorMsg('Barcode dan Nama Produk wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: identity.barcode.trim(),
          name: identity.name.trim(),
          brand: identity.brand.trim() || undefined,
          category: identity.category.trim() || undefined,
          servingSize: identity.servingSize.trim() || undefined,
          energy: nutrition.energy ? parseFloat(nutrition.energy) : undefined,
          carbohydrates: nutrition.carbohydrates ? parseFloat(nutrition.carbohydrates) : undefined,
          sugars: nutrition.sugars ? parseFloat(nutrition.sugars) : undefined,
          fat: nutrition.fat ? parseFloat(nutrition.fat) : undefined,
          saturatedFat: nutrition.saturatedFat ? parseFloat(nutrition.saturatedFat) : undefined,
          proteins: nutrition.proteins ? parseFloat(nutrition.proteins) : undefined,
          sodium: nutrition.sodium ? parseFloat(nutrition.sodium) : undefined,
          fiber: nutrition.fiber ? parseFloat(nutrition.fiber) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan produk.');
      }

      router.push(
        `/admin/products?created=true&msg=${encodeURIComponent(data.message || 'Produk berhasil ditambahkan.')}`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    identity,
    nutrition,
    isSubmitting,
    errorMsg,
    setErrorMsg,
    updateIdentity,
    updateNutrition,
    submitForm,
  };
}
