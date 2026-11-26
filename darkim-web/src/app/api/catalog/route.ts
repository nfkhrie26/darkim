import { NextRequest, NextResponse } from 'next/server';
import { OpenFoodFactsService } from '@/services/openFoodFactsService';
import { ProductRepository } from '@/services/productRepository';
import { CatalogProductItem, CatalogSearchResponse } from '@/types';

/**
 * GET /api/catalog
 * Server proxy to fetch catalog products from OpenFoodFacts (GET)
 * with graceful fallback to local PostgreSQL database when OFF is overloaded or offline.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || 'all').toLowerCase();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(searchParams.get('pageSize')) || 6));

  try {
    const offResult = await OpenFoodFactsService.searchCatalog({
      query,
      category,
      page,
      pageSize,
    });

    if (offResult) {
      const response: CatalogSearchResponse = {
        success: true,
        source: 'openfoodfacts',
        ...offResult,
      };
      return NextResponse.json(response);
    }
  } catch (err) {
    console.warn('[/api/catalog] OpenFoodFacts lookup error, falling back to local DB:', err);
  }

  // Fallback to local PostgreSQL catalog if OpenFoodFacts fails or returns 503/timeout
  try {
    const localRows = await ProductRepository.getAll(query || undefined);
    const filtered = localRows.filter((item) => {
      if (category === 'all') return true;
      const { category: resolvedCat, isBeverage } = OpenFoodFactsService.resolveIndonesianCategory(
        item.name || '',
        [],
        item.category || ''
      );
      if (category === 'minuman') return isBeverage;
      if (category === 'makanan') return !isBeverage;
      if (category === 'snack') return /snack|camilan|keripik|crisps|popcorn|kripik/i.test(resolvedCat);
      if (category === 'susu-olahan') return /susu|mentega|cheese|keju|dairy|butter/i.test(resolvedCat);
      if (category === 'mie-pasta') return /mie|pasta|noodle|spaghetti|ramen|bihun/i.test(resolvedCat);
      if (category === 'biskuit-kue') return /biskuit|kue|biscuit|cake|roti|wafer|cookie/i.test(resolvedCat);
      if (category === 'saus-bumbu') return /minyak|bumbu|saus|sauce|kecap|sambal|seasoning/i.test(resolvedCat);
      if (category === 'cokelat-permen') return /cokelat|chocolate|permen|candy/i.test(resolvedCat);
      if (category === 'sereal') return /sereal|cereal|oat|granola|beras|rice/i.test(resolvedCat);
      return true;
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * pageSize;

    const products: CatalogProductItem[] = filtered.slice(startIdx, startIdx + pageSize).map((p) => ({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      brand: p.brand,
      category: p.category,
      image: p.image,
    }));

    const response: CatalogSearchResponse = {
      success: true,
      source: 'local-fallback',
      products,
      page: safePage,
      pageSize,
      totalCount,
      totalPages,
      message: 'Menampilkan data cache lokal karena server OpenFoodFacts sedang sibuk.',
    };
    return NextResponse.json(response);
  } catch (dbErr) {
    console.error('[/api/catalog] Local DB fallback failed:', dbErr);
    return NextResponse.json(
      {
        success: false,
        source: 'local-fallback',
        products: [],
        page: 1,
        pageSize,
        totalCount: 0,
        totalPages: 1,
        message: 'Gagal memuat katalog produk dari OpenFoodFacts maupun database lokal.',
      },
      { status: 500 }
    );
  }
}
