import { NextRequest, NextResponse } from 'next/server';
import { MlVisionService } from '@/services/mlVisionService';
import { ProductRepository } from '@/services/productRepository';
import { OpenFoodFactsService } from '@/services/openFoodFactsService';
import { evaluateNutrition } from '@/services/nutritionEvaluator';
import { HealthProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    let barcode: string | null = null;
    let profile: HealthProfile = 'diabetes';
    let fileBuffer: Buffer | null = null;
    let fileName = 'scan.jpg';
    let scanMode: 'fast' | 'deep' = 'deep';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const explicitBarcode = formData.get('barcode') as string | null;
      const explicitProfile = formData.get('profile') as HealthProfile | null;
      const explicitMode = formData.get('mode') as string | null;

      if (explicitProfile && (explicitProfile === 'hipertensi' || explicitProfile === 'diabetes')) {
        profile = explicitProfile;
      }
      if (explicitBarcode) {
        barcode = explicitBarcode.trim();
      }
      if (explicitMode === 'fast' || explicitMode === 'deep') {
        scanMode = explicitMode;
      }

      if (file && file.size > 0) {
        fileName = file.name;
        const arrayBuf = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
      }
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.profile && (body.profile === 'hipertensi' || body.profile === 'diabetes')) {
        profile = body.profile;
      }
      if (body.barcode) {
        barcode = String(body.barcode).trim();
      }
      if (body.mode === 'fast' || body.mode === 'deep') {
        scanMode = body.mode;
      }
    }

    let mlStage: string | undefined;
    let mlTimeMs: number | undefined;

    // 1. If no direct barcode provided but image exists, send to ML Engine
    if (!barcode && fileBuffer) {
      const mlResult = await MlVisionService.extractBarcode(fileBuffer, fileName, scanMode);
      if (!mlResult.success || !mlResult.barcode) {
        return NextResponse.json({
          success: false,
          detected: false,
          message: mlResult.message || 'Gagal mendeteksi barcode dari gambar. Pastikan barcode terlihat jelas dan fokus.',
        }, { status: scanMode === 'fast' ? 200 : 422 });
      }
      barcode = mlResult.barcode;
      mlStage = mlResult.stage;
      mlTimeMs = mlResult.time_ms;
    }

    if (!barcode) {
      return NextResponse.json({
        success: false,
        detected: false,
        message: 'Barcode atau citra kemasan harus disertakan.',
      }, { status: 400 });
    }

    // 2. Query directly from OpenFoodFacts (Global Single Source of Truth, no local DB caching needed)
    let product: any = null;
    const offProduct = await OpenFoodFactsService.getByBarcode(barcode);

    if (offProduct) {
      product = OpenFoodFactsService.toProductModel(offProduct);
    } else {
      // Optional fallback to local DB if previously seeded or offline
      product = await ProductRepository.findByBarcode(barcode);
    }

    // 3. Fallback Crowdsourcing if still not found
    if (!product) {
      return NextResponse.json({
        success: false,
        detected: true,
        notFound: true,
        barcode,
        stage: mlStage,
        time_ms: mlTimeMs,
        message: 'Produk tidak ditemukan di OpenFoodFacts.',
      }, { status: 404 });
    }

    // 5. Evaluate Nutrition based on chosen Profile (Hipertensi vs Diabetes)
    const evaluation = evaluateNutrition(product, profile);

    return NextResponse.json({
      success: true,
      detected: true,
      barcode,
      product,
      evaluation,
      stage: mlStage,
      time_ms: mlTimeMs,
    });
  } catch (err: any) {
    console.error('API /api/scan error:', err);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses pemindaian.',
    }, { status: 500 });
  }
}
