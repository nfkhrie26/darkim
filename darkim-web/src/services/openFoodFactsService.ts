export interface NormalizedOffProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  energy?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  fat?: number;
  saturatedFat?: number;
  sodium?: number; // mg
  salt?: number; // g
  image?: string;
  rawData?: any;
}

export class OpenFoodFactsService {
  private static BASE_URL = 'https://world.openfoodfacts.org';

  /**
   * Fetch product details by barcode from OpenFoodFacts
   */
  static async getByBarcode(barcode: string): Promise<NormalizedOffProduct | null> {
    try {
      const cleanBarcode = barcode.trim();
      const url = `${this.BASE_URL}/api/v2/product/${cleanBarcode}.json`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'DARKIM-NutritionApp/1.0 (https://github.com/darkim-project)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.status !== 1 || !data.product) return null;

      const p = data.product;
      const n = p.nutriments || {};

      // OpenFoodFacts sodium can be in g or mg
      let sodiumMg = 0;
      if (n['sodium_100g'] !== undefined) {
        sodiumMg = Math.round(Number(n['sodium_100g']) * 1000);
      } else if (n['sodium_serving'] !== undefined) {
        sodiumMg = Math.round(Number(n['sodium_serving']) * 1000);
      } else if (n['salt_100g'] !== undefined) {
        sodiumMg = Math.round((Number(n['salt_100g']) / 2.5) * 1000);
      }

      const saltG = n['salt_100g'] !== undefined ? Number(n['salt_100g']) : (sodiumMg * 2.5) / 1000;

      return {
        barcode: cleanBarcode,
        name: p.product_name_id || p.product_name || p.product_name_en || 'Produk Tanpa Nama',
        brand: p.brands || 'Tanpa Brand',
        category: p.categories_tags?.[0]?.replace(/^id:|^en:/, '') || p.categories || 'Makanan & Minuman',
        energy: n['energy-kcal_100g'] ? Number(n['energy-kcal_100g']) : (n['energy-kcal'] ? Number(n['energy-kcal']) : 0),
        carbohydrates: n['carbohydrates_100g'] ? Number(n['carbohydrates_100g']) : 0,
        sugars: n['sugars_100g'] ? Number(n['sugars_100g']) : 0,
        fiber: n['fiber_100g'] ? Number(n['fiber_100g']) : 0,
        proteins: n['proteins_100g'] ? Number(n['proteins_100g']) : 0,
        fat: n['fat_100g'] ? Number(n['fat_100g']) : 0,
        saturatedFat: n['saturated-fat_100g'] ? Number(n['saturated-fat_100g']) : 0,
        sodium: sodiumMg,
        salt: Number(saltG.toFixed(2)),
        image: p.image_url || p.image_front_url || null,
        rawData: p,
      };
    } catch (err) {
      console.warn(`[OpenFoodFacts] Failed fetching barcode ${barcode}:`, err);
      return null;
    }
  }

  /**
   * Search products by product name (Fuzzy search for Admin resolution)
   */
  static async fuzzySearchByName(query: string, limit = 10): Promise<NormalizedOffProduct[]> {
    try {
      const q = encodeURIComponent(query.trim());
      const url = `${this.BASE_URL}/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=${limit}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'DARKIM-NutritionApp/1.0 (https://github.com/darkim-project)',
        },
        signal: AbortSignal.timeout(7000),
      });

      if (!res.ok) return [];
      const data = await res.json();
      if (!data || !Array.isArray(data.products)) return [];

      return data.products.map((p: any) => {
        const n = p.nutriments || {};
        let sodiumMg = 0;
        if (n['sodium_100g'] !== undefined) {
          sodiumMg = Math.round(Number(n['sodium_100g']) * 1000);
        } else if (n['salt_100g'] !== undefined) {
          sodiumMg = Math.round((Number(n['salt_100g']) / 2.5) * 1000);
        }

        return {
          barcode: p.code || '',
          name: p.product_name_id || p.product_name || p.product_name_en || 'Tanpa Nama',
          brand: p.brands || 'Tanpa Brand',
          category: p.categories_tags?.[0]?.replace(/^id:|^en:/, '') || 'Makanan & Minuman',
          energy: n['energy-kcal_100g'] ? Number(n['energy-kcal_100g']) : 0,
          carbohydrates: n['carbohydrates_100g'] ? Number(n['carbohydrates_100g']) : 0,
          sugars: n['sugars_100g'] ? Number(n['sugars_100g']) : 0,
          proteins: n['proteins_100g'] ? Number(n['proteins_100g']) : 0,
          fat: n['fat_100g'] ? Number(n['fat_100g']) : 0,
          sodium: sodiumMg,
          image: p.image_url || p.image_front_url || null,
        };
      });
    } catch (err) {
      console.warn(`[OpenFoodFacts] Fuzzy search failed for '${query}':`, err);
      return [];
    }
  }
}

