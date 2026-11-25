import { NextRequest, NextResponse } from 'next/server';
import { OpenFoodFactsService } from '@/services/openFoodFactsService';
import { ProductRepository } from '@/services/productRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || undefined;

    let products: any[] = [];
    if (query && query.trim()) {
      const cleanQ = query.trim();
      // If it looks like a barcode, query directly by barcode from Open Food Facts
      if (/^\d{8,14}$/.test(cleanQ)) {
        const offProduct = await OpenFoodFactsService.getByBarcode(cleanQ);
        if (offProduct) {
          products = [OpenFoodFactsService.toProductModel(offProduct)];
        }
      }

      // If not found by barcode or query is text, perform search
      if (products.length === 0) {
        const offResults = await OpenFoodFactsService.fuzzySearchByName(cleanQ, 20);
        if (offResults.length > 0) {
          products = offResults.map((p) => OpenFoodFactsService.toProductModel(p));
        } else {
          // Graceful fallback to local DB search if OFF search is rate-limited
          const localProducts = await ProductRepository.getAll(cleanQ);
          products = localProducts;
        }
      }
    } else {
      // Default view: show local products if any exist, otherwise fetch from Open Food Facts
      const localProducts = await ProductRepository.getAll();
      if (localProducts.length > 0) {
        products = localProducts;
      } else {
        const offResults = await OpenFoodFactsService.fuzzySearchByName('indonesia', 20);
        products = offResults.map((p) => OpenFoodFactsService.toProductModel(p));
      }
    }

    return NextResponse.json({ success: true, products, source: 'openfoodfacts' });
  } catch (err: any) {
    console.error('API /api/admin/products GET error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat produk dari Open Food Facts.',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.barcode || !body.name) {
      return NextResponse.json({
        success: false,
        message: 'Barcode dan nama produk wajib diisi.',
      }, { status: 400 });
    }

    // Direct write to Open Food Facts API (no local DB saving)
    const offResult = await OpenFoodFactsService.writeProduct({
      barcode: String(body.barcode).trim(),
      name: String(body.name).trim(),
      brand: body.brand ? String(body.brand).trim() : undefined,
      category: body.category ? String(body.category).trim() : undefined,
      servingSize: body.servingSize ? String(body.servingSize).trim() : undefined,
      energy: body.energy !== undefined && body.energy !== '' ? Number(body.energy) : undefined,
      carbohydrates: body.carbohydrates !== undefined && body.carbohydrates !== '' ? Number(body.carbohydrates) : undefined,
      sugars: body.sugars !== undefined && body.sugars !== '' ? Number(body.sugars) : undefined,
      fiber: body.fiber !== undefined && body.fiber !== '' ? Number(body.fiber) : undefined,
      proteins: body.proteins !== undefined && body.proteins !== '' ? Number(body.proteins) : undefined,
      fat: body.fat !== undefined && body.fat !== '' ? Number(body.fat) : undefined,
      saturatedFat: body.saturatedFat !== undefined && body.saturatedFat !== '' ? Number(body.saturatedFat) : undefined,
      sodium: body.sodium !== undefined && body.sodium !== '' ? Number(body.sodium) : undefined,
      salt: body.salt !== undefined && body.salt !== '' ? Number(body.salt) : undefined,
    });

    if (!offResult.success) {
      return NextResponse.json({
        success: false,
        message: offResult.message || 'Gagal menyimpan ke Open Food Facts.',
        offResult,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Produk berhasil dikirim langsung ke database Open Food Facts (${offResult.environment})!`,
      offResult,
    });
  } catch (err: any) {
    console.error('API /api/admin/products POST error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengirim produk ke Open Food Facts.',
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // In pure Open Food Facts mode, local product records are not maintained
  return NextResponse.json({
    success: true,
    message: 'Data Open Food Facts dikelola secara terpusat di server Open Food Facts.',
  });
}

