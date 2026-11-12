import { NextRequest, NextResponse } from 'next/server';
import { OpenFoodFactsService } from '@/services/openFoodFactsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await OpenFoodFactsService.fuzzySearchByName(query);
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error('API /api/admin/off-search error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal mencari produk di OpenFoodFacts.',
    }, { status: 500 });
  }
}

