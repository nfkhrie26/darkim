import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/services/productRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || undefined;
    const products = await ProductRepository.getAll(query);

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error('API /api/admin/products GET error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal memuat produk dari database.',
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

    const product = await ProductRepository.upsertManual(body);
    return NextResponse.json({
      success: true,
      message: 'Produk berhasil disimpan.',
      product,
    });
  } catch (err: any) {
    console.error('API /api/admin/products POST error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal menyimpan produk.',
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID produk wajib disertakan.',
      }, { status: 400 });
    }

    await ProductRepository.delete(id);
    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus.',
    });
  } catch (err: any) {
    console.error('API /api/admin/products DELETE error:', err);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus produk.',
    }, { status: 500 });
  }
}

