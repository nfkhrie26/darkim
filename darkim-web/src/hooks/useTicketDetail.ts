'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TicketModel } from '@/types';
import { NutritionValues } from '@/components/admin/NutritionInputGrid';

export interface ParsedUserDescription {
  isManualInput: boolean;
  productName?: string;
  brand?: string;
  category?: string;
  servingSize?: string;
  energy?: number | null;
  carbohydrates?: number | null;
  sugars?: number | null;
  fat?: number | null;
  saturatedFat?: number | null;
  proteins?: number | null;
  sodium?: number | null;
  fiber?: number | null;
  userNote?: string;
  rawText?: string;
}

export function parseTicketDescription(desc?: string | null): ParsedUserDescription {
  if (!desc) return { isManualInput: false };
  try {
    const parsed = JSON.parse(desc);
    if (parsed && parsed.isManualInput) {
      return {
        isManualInput: true,
        ...parsed,
      };
    }
  } catch {}
  return {
    isManualInput: false,
    rawText: desc,
  };
}

export function useTicketDetail(ticketId: string) {
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resolutionMode, setResolutionMode] = useState<'OFF' | 'MANUAL'>('OFF');
  const [isResolving, setIsResolving] = useState(false);
  const [isUserPrefilled, setIsUserPrefilled] = useState(false);

  // Manual fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [servingSize, setServingSize] = useState('100 ml');

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

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const updateNutrition = (field: keyof NutritionValues, value: string) => {
    setNutrition((prev) => ({ ...prev, [field]: value }));
  };

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?id=${ticketId}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicket(data.ticket);
        const parsed = parseTicketDescription(data.ticket.description);
        if (parsed.isManualInput) {
          setResolutionMode('MANUAL');
          setIsUserPrefilled(true);
          setName(parsed.productName || '');
          setBrand(parsed.brand || '');
          setCategory(parsed.category || 'Makanan & Minuman');
          setServingSize(parsed.servingSize || '100 ml');
          setNutrition({
            energy: parsed.energy !== undefined && parsed.energy !== null ? String(parsed.energy) : '',
            carbohydrates: parsed.carbohydrates !== undefined && parsed.carbohydrates !== null ? String(parsed.carbohydrates) : '',
            sugars: parsed.sugars !== undefined && parsed.sugars !== null ? String(parsed.sugars) : '',
            fat: parsed.fat !== undefined && parsed.fat !== null ? String(parsed.fat) : '',
            saturatedFat: parsed.saturatedFat !== undefined && parsed.saturatedFat !== null ? String(parsed.saturatedFat) : '',
            proteins: parsed.proteins !== undefined && parsed.proteins !== null ? String(parsed.proteins) : '',
            sodium: parsed.sodium !== undefined && parsed.sodium !== null ? String(parsed.sodium) : '',
            fiber: parsed.fiber !== undefined && parsed.fiber !== null ? String(parsed.fiber) : '',
          });
        } else if (parsed.rawText) {
          setName(parsed.rawText);
        }
      } else {
        setError(data.message || 'Tiket tidak ditemukan.');
      }
    } catch {
      setError('Gagal memuat data tiket dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const resolveViaOff = async (offBarcode: string) => {
    if (!ticket) return;
    setIsResolving(true);
    try {
      const res = await fetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          method: 'OFF_FUZZY',
          offBarcode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/tickets?msg=' + encodeURIComponent('Tiket berhasil diselesaikan via Open Food Facts!'));
      } else {
        alert(data.message || 'Gagal menyelesaikan tiket.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsResolving(false);
    }
  };

  const resolveViaManual = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticket) return;
    if (!name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }

    setIsResolving(true);
    try {
      const res = await fetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          method: 'MANUAL',
          manualData: {
            name: name.trim(),
            brand: brand.trim() || undefined,
            category: category.trim() || undefined,
            servingSize: servingSize.trim() || undefined,
            energy: nutrition.energy ? Number(nutrition.energy) : undefined,
            carbohydrates: nutrition.carbohydrates ? Number(nutrition.carbohydrates) : undefined,
            sugars: nutrition.sugars ? Number(nutrition.sugars) : undefined,
            fiber: nutrition.fiber ? Number(nutrition.fiber) : undefined,
            proteins: nutrition.proteins ? Number(nutrition.proteins) : undefined,
            fat: nutrition.fat ? Number(nutrition.fat) : undefined,
            saturatedFat: nutrition.saturatedFat ? Number(nutrition.saturatedFat) : undefined,
            sodium: nutrition.sodium ? Number(nutrition.sodium) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/tickets?msg=' + encodeURIComponent(data.message || 'Tiket berhasil diselesaikan!'));
      } else {
        alert(data.message || 'Gagal menyimpan input gizi manual.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsResolving(false);
    }
  };

  return {
    ticket,
    loading,
    error,
    resolutionMode,
    setResolutionMode,
    isResolving,
    isUserPrefilled,
    name,
    setName,
    brand,
    setBrand,
    category,
    setCategory,
    servingSize,
    setServingSize,
    nutrition,
    updateNutrition,
    previewImage,
    setPreviewImage,
    resolveViaOff,
    resolveViaManual,
  };
}
