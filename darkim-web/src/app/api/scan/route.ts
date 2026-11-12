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

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const explicitBarcode = formData.get('barcode') as string | null;
      const explicitProfile = formData.get('profile') as HealthProfile | null;

      if (explicitProfile && (explicitProfile === 'hipertensi' || explicitProfile === 'diabetes')) {
        profile = explicitProfile;
      }
      if (explicitBarcode) {
        barcode = explicitBarcode.trim();
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
    }

    // 1. If no direct barcode provided but image exists, send to ML Engine
    if (!barcode && fileBuffer) {
      const mlResult = await MlVisionService.extractBarcode(fileBuffer, fileName);
      if (!mlResult.success || !mlResult.barcode) {
        return NextResponse.json({
          success: false,
          message: mlResult.message || 'Gagal mendeteksi barcode dari gambar. Pastikan barcode terlihat jelas dan fokus.',
        }, { status: 422 });
      }
      barcode = mlResult.barcode;
    }

    if (!barcode) {
      return NextResponse.json({
        success: false,
        message: 'Barcode atau citra kemasan harus disertakan.',
      }, { status: 400 });
    }

    // 2. Step 1: Check Local PostgreSQL Database
    let product = await ProductRepository.findByBarcode(barcode);

    // 3. Step 2: Auto-fetch from OpenFoodFacts if not in DB
    if (!product) {
      const offProduct = await OpenFoodFactsService.getByBarcode(barcode);
      if (offProduct) {
        // Step 3: Auto-Insert Cache to PostgreSQL
        product = await ProductRepository.createFromOpenFoodFacts(offProduct);
      }
    }

    // 4. Step 4: Fallback Crowdsourcing if still not found anywhere
    if (!product) {
      return NextResponse.json({
        success: false,
        notFound: true,
        barcode,
        message: 'Produk tidak ditemukan pada database lokal maupun OpenFoodFacts.',
      }, { status: 404 });
    }

    // 5. Evaluate Nutrition based on chosen Profile (Hipertensi vs Diabetes)
    const evaluation = evaluateNutrition(product, profile);

    return NextResponse.json({
      success: true,
      barcode,
      product,
      evaluation,
    });
  } catch (err: any) {
    console.error('API /api/scan error:', err);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses pemindaian.',
    }, { status: 500 });
  }
}

