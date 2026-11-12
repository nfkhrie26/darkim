import { prisma } from '@/lib/prisma';
import { NormalizedOffProduct } from './openFoodFactsService';

export class ProductRepository {
  /**
   * Find product by its exact barcode
   */
  static async findByBarcode(barcode: string) {
    if (!barcode) return null;
    return await prisma.product.findUnique({
      where: { barcode: barcode.trim() },
    });
  }

  /**
   * Insert product retrieved from OpenFoodFacts into PostgreSQL cache
   */
  static async createFromOpenFoodFacts(off: NormalizedOffProduct, customBarcode?: string) {
    const finalBarcode = (customBarcode || off.barcode).trim();
    return await prisma.product.upsert({
      where: { barcode: finalBarcode },
      update: {
        name: off.name,
        brand: off.brand,
        category: off.category,
        energy: off.energy,
        carbohydrates: off.carbohydrates,
        sugars: off.sugars,
        fiber: off.fiber,
        proteins: off.proteins,
        fat: off.fat,
        saturatedFat: off.saturatedFat,
        sodium: off.sodium,
        salt: off.salt,
        image: off.image,
        rawData: off.rawData ?? undefined,
      },
      create: {
        barcode: finalBarcode,
        name: off.name,
        brand: off.brand,
        category: off.category,
        energy: off.energy,
        carbohydrates: off.carbohydrates,
        sugars: off.sugars,
        fiber: off.fiber,
        proteins: off.proteins,
        fat: off.fat,
        saturatedFat: off.saturatedFat,
        sodium: off.sodium,
        salt: off.salt,
        image: off.image,
        rawData: off.rawData ?? undefined,
      },
    });
  }

  /**
   * Insert or update product manually by Admin
   */
  static async upsertManual(data: {
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    energy?: number;
    carbohydrates?: number;
    sugars?: number;
    fiber?: number;
    proteins?: number;
    fat?: number;
    saturatedFat?: number;
    sodium?: number;
    salt?: number;
    image?: string;
  }) {
    const barcode = data.barcode.trim();
    return await prisma.product.upsert({
      where: { barcode },
      update: {
        name: data.name,
        brand: data.brand || 'Tanpa Brand',
        category: data.category || 'Makanan & Minuman',
        energy: data.energy ?? null,
        carbohydrates: data.carbohydrates ?? null,
        sugars: data.sugars ?? null,
        fiber: data.fiber ?? null,
        proteins: data.proteins ?? null,
        fat: data.fat ?? null,
        saturatedFat: data.saturatedFat ?? null,
        sodium: data.sodium ?? null,
        salt: data.salt ?? null,
        image: data.image ?? null,
      },
      create: {
        barcode,
        name: data.name,
        brand: data.brand || 'Tanpa Brand',
        category: data.category || 'Makanan & Minuman',
        energy: data.energy ?? null,
        carbohydrates: data.carbohydrates ?? null,
        sugars: data.sugars ?? null,
        fiber: data.fiber ?? null,
        proteins: data.proteins ?? null,
        fat: data.fat ?? null,
        saturatedFat: data.saturatedFat ?? null,
        sodium: data.sodium ?? null,
        salt: data.salt ?? null,
        image: data.image ?? null,
      },
    });
  }

  /**
   * Get all products with optional query filtering
   */
  static async getAll(query?: string) {
    if (!query) {
      return await prisma.product.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 100,
      });
    }

    const q = query.trim();
    return await prisma.product.findMany({
      where: {
        OR: [
          { barcode: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  static async delete(id: string) {
    return await prisma.product.delete({ where: { id } });
  }
}

