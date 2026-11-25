import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenFoodFactsService } from '@/services/openFoodFactsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barcode, productId } = body;

    if (!barcode && !productId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Barcode atau Product ID wajib disertakan untuk sinkronisasi.',
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: barcode ? { barcode: String(barcode).trim() } : { id: String(productId).trim() },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Produk tidak ditemukan di database lokal.',
        },
        { status: 404 }
      );
    }

    // Call Open Food Facts Write API
    const offResult = await OpenFoodFactsService.writeProduct({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      category: product.category,
      energy: product.energy,
      carbohydrates: product.carbohydrates,
      sugars: product.sugars,
      fiber: product.fiber,
      proteins: product.proteins,
      fat: product.fat,
      saturatedFat: product.saturatedFat,
      sodium: product.sodium,
      salt: product.salt,
    });

    // Update product rawData with offSync metadata
    const existingRawData = (product.rawData as Record<string, any>) || {};
    await prisma.product.update({
      where: { id: product.id },
      data: {
        rawData: {
          ...existingRawData,
          offSync: {
            syncedAt: new Date().toISOString(),
            environment: offResult.environment,
            status: offResult.status,
            message: offResult.message,
          },
        },
      },
    });

    return NextResponse.json({
      success: offResult.success,
      message: offResult.message,
      environment: offResult.environment,
      offResult,
    });
  } catch (err: any) {
    console.error('API /api/admin/off-sync error:', err);
    return NextResponse.json(
      {
        success: false,
        message: `Terjadi kesalahan internal sinkronisasi: ${err?.message || 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
