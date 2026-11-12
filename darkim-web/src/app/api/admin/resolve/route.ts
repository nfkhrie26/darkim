import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductRepository } from '@/services/productRepository';
import { OpenFoodFactsService } from '@/services/openFoodFactsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, method, offBarcode, manualData } = body;

    if (!ticketId || !method) {
      return NextResponse.json({
        success: false,
        message: 'ticketId dan method penyelesaian wajib disertakan.',
      }, { status: 400 });
    }

    const ticket = await prisma.productTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({
        success: false,
        message: 'Tiket tidak ditemukan.',
      }, { status: 404 });
    }

    if (method === 'OFF_FUZZY') {
      if (!offBarcode) {
        return NextResponse.json({
          success: false,
          message: 'Barcode produk OpenFoodFacts wajib dipilih.',
        }, { status: 400 });
      }

      // Fetch from OFF
      const offProduct = await OpenFoodFactsService.getByBarcode(offBarcode);
      if (!offProduct) {
        return NextResponse.json({
          success: false,
          message: 'Produk tidak ditemukan di OpenFoodFacts.',
        }, { status: 404 });
      }

      // Save to local PostgreSQL with the ticket's barcode!
      await ProductRepository.createFromOpenFoodFacts(offProduct, ticket.barcode);

      // Update ticket to RESOLVED
      const updatedTicket = await prisma.productTicket.update({
        where: { id: ticketId },
        data: {
          status: 'RESOLVED',
          resolutionMethod: 'OFF_FUZZY',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tiket berhasil diselesaikan. Produk ditautkan ke barcode ${ticket.barcode}.`,
        ticket: updatedTicket,
      });
    } else if (method === 'MANUAL') {
      if (!manualData || !manualData.name) {
        return NextResponse.json({
          success: false,
          message: 'Data nama produk wajib diisi pada input manual.',
        }, { status: 400 });
      }

      await ProductRepository.upsertManual({
        barcode: ticket.barcode,
        name: manualData.name,
        brand: manualData.brand,
        category: manualData.category,
        energy: manualData.energy ? Number(manualData.energy) : undefined,
        carbohydrates: manualData.carbohydrates ? Number(manualData.carbohydrates) : undefined,
        sugars: manualData.sugars ? Number(manualData.sugars) : undefined,
        fiber: manualData.fiber ? Number(manualData.fiber) : undefined,
        proteins: manualData.proteins ? Number(manualData.proteins) : undefined,
        fat: manualData.fat ? Number(manualData.fat) : undefined,
        saturatedFat: manualData.saturatedFat ? Number(manualData.saturatedFat) : undefined,
        sodium: manualData.sodium ? Number(manualData.sodium) : undefined,
        salt: manualData.salt ? Number(manualData.salt) : undefined,
        image: manualData.image || ticket.frontPhoto || undefined,
      });

      const updatedTicket = await prisma.productTicket.update({
        where: { id: ticketId },
        data: {
          status: 'RESOLVED',
          resolutionMethod: 'MANUAL',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tiket berhasil diselesaikan secara manual untuk barcode ${ticket.barcode}.`,
        ticket: updatedTicket,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Metode penyelesaian tidak valid.',
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error('API /api/admin/resolve error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal menyelesaikan tiket laporan.',
    }, { status: 500 });
  }
}

