import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toOptionalNumber } from '@/lib/nutritionConversion';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let barcode = '';
    let description: string | null = null;
    let frontPhotoPath: string | null = null;
    let nutritionPhotoPath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      barcode = (formData.get('barcode') as string || '').trim();
      description = (formData.get('description') as string || null);
      const rawManualData = formData.get('manualData') as string | null;

      if (rawManualData) {
        try {
          const m = JSON.parse(rawManualData);
          description = JSON.stringify({
            isManualInput: true,
            productName: m.name || 'Produk Tanpa Nama',
            brand: m.brand || '',
            category: m.category || 'Makanan & Minuman',
            servingSize: m.servingSize || '',
            energy: toOptionalNumber(m.energy) ?? null,
            carbohydrates: toOptionalNumber(m.carbohydrates) ?? null,
            sugars: toOptionalNumber(m.sugars) ?? null,
            fat: toOptionalNumber(m.fat) ?? null,
            saturatedFat: toOptionalNumber(m.saturatedFat) ?? null,
            proteins: toOptionalNumber(m.proteins) ?? null,
            sodium: toOptionalNumber(m.sodium) ?? null,
            fiber: toOptionalNumber(m.fiber) ?? null,
            userNote: description || '',
          });
        } catch {}
      }

      const frontFile = formData.get('frontPhoto') as File | null;
      const nutritionFile = formData.get('nutritionPhoto') as File | null;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tickets');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      if (frontFile && frontFile.size > 0) {
        const ext = path.extname(frontFile.name) || '.jpg';
        const filename = `front_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(uploadDir, filename);
        const buffer = Buffer.from(await frontFile.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        frontPhotoPath = `/uploads/tickets/${filename}`;
      }

      if (nutritionFile && nutritionFile.size > 0) {
        const ext = path.extname(nutritionFile.name) || '.jpg';
        const filename = `nutrition_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(uploadDir, filename);
        const buffer = Buffer.from(await nutritionFile.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        nutritionPhotoPath = `/uploads/tickets/${filename}`;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      barcode = (body.barcode || '').trim();
      description = body.description || null;

      if (body.manualData) {
        const m = body.manualData;
        description = JSON.stringify({
          isManualInput: true,
          productName: m.name || 'Produk Tanpa Nama',
          brand: m.brand || '',
          category: m.category || 'Makanan & Minuman',
          servingSize: m.servingSize || '',
          energy: toOptionalNumber(m.energy) ?? null,
          carbohydrates: toOptionalNumber(m.carbohydrates) ?? null,
          sugars: toOptionalNumber(m.sugars) ?? null,
          fat: toOptionalNumber(m.fat) ?? null,
          saturatedFat: toOptionalNumber(m.saturatedFat) ?? null,
          proteins: toOptionalNumber(m.proteins) ?? null,
          sodium: toOptionalNumber(m.sodium) ?? null,
          fiber: toOptionalNumber(m.fiber) ?? null,
          userNote: body.description || '',
        });
      }
    }

    if (!barcode) {
      return NextResponse.json({
        success: false,
        message: 'Kode barcode wajib disertakan.',
      }, { status: 400 });
    }

    const ticket = await prisma.productTicket.create({
      data: {
        barcode,
        description: description?.trim() || null,
        frontPhoto: frontPhotoPath,
        nutritionPhoto: nutritionPhotoPath,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan tiket berhasil dikirim ke Administrator.',
      ticket,
    });
  } catch (err: any) {
    console.error('API /api/tickets POST error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal membuat tiket laporan.',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const ticket = await prisma.productTicket.findUnique({ where: { id } });
      if (!ticket) {
        return NextResponse.json({ success: false, message: 'Tiket tidak ditemukan.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ticket });
    }

    const status = searchParams.get('status');

    const where: any = {};
    if (status && ['PENDING', 'RESOLVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    const tickets = await prisma.productTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (err: any) {
    console.error('API /api/tickets GET error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data tiket.',
    }, { status: 500 });
  }
}

