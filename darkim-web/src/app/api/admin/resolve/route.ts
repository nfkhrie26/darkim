import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

      // Fetch from OFF to verify
      const offProduct = await OpenFoodFactsService.getByBarcode(offBarcode);
      if (!offProduct) {
        return NextResponse.json({
          success: false,
          message: 'Produk tidak ditemukan di OpenFoodFacts.',
        }, { status: 404 });
      }

      // If barcode differs, clone to the ticket barcode directly on Open Food Facts
      if (ticket.barcode !== offBarcode) {
        await OpenFoodFactsService.writeProduct({
          barcode: ticket.barcode,
          name: offProduct.name,
          brand: offProduct.brand,
          category: offProduct.category,
          energy: offProduct.energy,
          carbohydrates: offProduct.carbohydrates,
          sugars: offProduct.sugars,
          fiber: offProduct.fiber,
          proteins: offProduct.proteins,
          fat: offProduct.fat,
          saturatedFat: offProduct.saturatedFat,
          sodium: offProduct.sodium,
          salt: offProduct.salt,
        });
      }

      // Update ticket status in DB
      const updatedTicket = await prisma.productTicket.update({
        where: { id: ticketId },
        data: {
          status: 'RESOLVED',
          resolutionMethod: 'OFF_FUZZY',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tiket berhasil diselesaikan via Open Food Facts.`,
        ticket: updatedTicket,
      });
    } else if (method === 'MANUAL') {
      if (!manualData || !manualData.name) {
        return NextResponse.json({
          success: false,
          message: 'Data nama produk wajib diisi pada input manual.',
        }, { status: 400 });
      }

      // Write directly to Open Food Facts (no local product DB)
      const offSyncResult = await OpenFoodFactsService.writeProduct({
        barcode: ticket.barcode,
        name: manualData.name.trim(),
        brand: manualData.brand?.trim() || undefined,
        category: manualData.category?.trim() || undefined,
        servingSize: manualData.servingSize?.trim() || undefined,
        energy: manualData.energy ? Number(manualData.energy) : undefined,
        carbohydrates: manualData.carbohydrates ? Number(manualData.carbohydrates) : undefined,
        sugars: manualData.sugars ? Number(manualData.sugars) : undefined,
        fiber: manualData.fiber ? Number(manualData.fiber) : undefined,
        proteins: manualData.proteins ? Number(manualData.proteins) : undefined,
        fat: manualData.fat ? Number(manualData.fat) : undefined,
        saturatedFat: manualData.saturatedFat ? Number(manualData.saturatedFat) : undefined,
        sodium: manualData.sodium ? Number(manualData.sodium) : undefined,
        salt: manualData.salt ? Number(manualData.salt) : undefined,
      });

      // Update ticket to RESOLVED
      const updatedTicket = await prisma.productTicket.update({
        where: { id: ticketId },
        data: {
          status: 'RESOLVED',
          resolutionMethod: 'MANUAL',
        },
      });

      return NextResponse.json({
        success: true,
        message: offSyncResult.success
          ? `Tiket berhasil diselesaikan dan data dikirim ke Open Food Facts (${offSyncResult.environment}).`
          : `Tiket diselesaikan. Respon OFF: ${offSyncResult.message}`,
        ticket: updatedTicket,
        offSyncResult,
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

