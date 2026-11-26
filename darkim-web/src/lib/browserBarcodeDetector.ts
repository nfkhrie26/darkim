/**
 * Client-side native BarcodeDetector fallback for Deep Scan mode.
 * Uses hardware-accelerated browser Shape Detection API when supported (Chrome/Edge/Android).
 */
export async function detectBarcodeInBrowser(file: File): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const BarcodeDetectorCtor = (
    window as unknown as {
      BarcodeDetector?: new (opts?: { formats?: string[] }) => {
        detect: (image: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
      };
    }
  ).BarcodeDetector;

  if (!BarcodeDetectorCtor) return null;

  let bitmap: ImageBitmap | null = null;
  try {
    const detector = new BarcodeDetectorCtor({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
    });
    bitmap = await createImageBitmap(file);
    const detections = await detector.detect(bitmap);
    for (const item of detections) {
      const digits = String(item.rawValue || '').replace(/\D/g, '');
      if (digits.length >= 8 && digits.length <= 14) {
        return digits;
      }
    }
  } catch {
    // Silent fallback when browser codec/hardware rejects bitmap
  } finally {
    try {
      bitmap?.close();
    } catch {}
  }

  return null;
}
