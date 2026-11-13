export interface MlBarcodeResult {
  success: boolean;
  barcode?: string;
  format?: string;
  confidence?: number;
  stage?: string;
  time_ms?: number;
  bbox?: number[];
  message?: string;
}

export class MlVisionService {
  private static ML_URL = process.env.ML_ENGINE_URL || 'http://127.0.0.1:8001';

  /**
   * Send image buffer to Python FastAPI /api/v1/extract-barcode
   * @param imageBuffer Raw image buffer
   * @param filename Filename identifier
   * @param mode 'fast' untuk auto-scan realtime kamera, 'deep' untuk upload foto manual / OCR
   */
  static async extractBarcode(
    imageBuffer: Buffer,
    filename = 'scan.jpg',
    mode: 'fast' | 'deep' = 'deep'
  ): Promise<MlBarcodeResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
      formData.append('file', blob, filename);
      formData.append('mode', mode);

      const endpoint = `${this.ML_URL}/api/v1/extract-barcode`;
      const timeoutMs = mode === 'fast' ? 7000 : 30000;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) {
        const data = await res.json();

        return {
          success: Boolean(data.success && data.barcode),
          barcode: data.barcode || undefined,
          format: data.format || undefined,
          confidence: typeof data.confidence_score === 'number' ? data.confidence_score : data.confidence,
          stage: data.method_used || data.stage || 'Unknown Method',
          time_ms: typeof data.processing_time_ms === 'number' ? data.processing_time_ms : data.time_ms,
          bbox: Array.isArray(data.bbox) ? data.bbox : undefined,
          message: data.message,
        };
      } else {
        const errorText = await res.text().catch(() => '');
        console.warn(`[MlVisionService] FastAPI error HTTP ${res.status}:`, errorText);
      }
    } catch (err: any) {
      if (err.name === 'TimeoutError') {
        console.warn(`[MlVisionService] FastAPI request timed out (${mode} mode).`);
      } else {
        console.warn('[MlVisionService] Tidak dapat terhubung ke FastAPI engine:', err?.message || err);
      }
    }

    return {
      success: false,
      message: 'Barcode tidak terdeteksi oleh ML Engine. Pastikan barcode terlihat jelas, tegak, dan fokus.',
    };
  }
}
