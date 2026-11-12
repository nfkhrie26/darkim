export interface MlBarcodeResult {
  success: boolean;
  barcode?: string;
  confidence?: number;
  stage?: string;
  time_ms?: number;
  message?: string;
}

export class MlVisionService {
  private static ML_URL = process.env.ML_ENGINE_URL || 'http://127.0.0.1:8000';

  /**
   * Send image buffer to Python FastAPI /api/v1/extract-barcode
   */
  static async extractBarcode(imageBuffer: Buffer, filename = 'scan.jpg'): Promise<MlBarcodeResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
      formData.append('file', blob, filename);

      const res = await fetch(`${this.ML_URL}/api/v1/extract-barcode`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: Boolean(data.success && data.barcode),
          barcode: data.barcode,
          confidence: data.confidence,
          stage: data.stage,
          time_ms: data.time_ms,
          message: data.message,
        };
      }
    } catch (err: any) {
      console.warn('[MlVisionService] FastAPI engine call failed or timed out:', err?.message || err);
    }

    // Graceful fallback for demo or when ML engine is starting
    return {
      success: false,
      message: 'Barcode tidak terdeteksi oleh ML Engine. Pastikan barcode terlihat jelas dan fokus.',
    };
  }
}

