import { ProductModel } from '@/types';

export interface NormalizedOffProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  energy?: number | null;
  carbohydrates?: number | null;
  sugars?: number | null;
  fiber?: number | null;
  proteins?: number | null;
  fat?: number | null;
  saturatedFat?: number | null;
  sodium?: number | null; // mg
  salt?: number | null; // g
  image?: string | null;
  isNutritionComplete?: boolean;
  nutritionCompletenessScore?: number; // 0 - 100
  offLastModified?: number | null; // timestamp epoch
  rawData?: any;
}

export interface OffWriteProductData {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  servingSize?: string;
  energy?: number | null; // kkal
  carbohydrates?: number | null; // g
  sugars?: number | null; // g
  fiber?: number | null; // g
  proteins?: number | null; // g
  fat?: number | null; // g
  saturatedFat?: number | null; // g
  sodium?: number | null; // mg (akan dikonversi ke g untuk OFF)
  salt?: number | null; // g
}

export interface OffWriteResult {
  success: boolean;
  status: number;
  message: string;
  environment: 'staging' | 'production';
  rawResponse?: any;
}

export class OpenFoodFactsService {
  private static BASE_URL = 'https://world.openfoodfacts.org';

  // Request only essential fields from OFF to reduce payload by up to 90% and speed up response
  private static TARGET_FIELDS = [
    'code',
    'product_name',
    'product_name_id',
    'product_name_en',
    'brands',
    'categories',
    'categories_tags',
    'image_url',
    'image_front_url',
    'nutriments',
    'serving_size',
    'last_modified_t',
  ].join(',');

  /**
   * Convert NormalizedOffProduct into the application ProductModel interface (in-memory, no DB write needed)
   */
  static toProductModel(off: NormalizedOffProduct): ProductModel {
    return {
      id: off.barcode,
      barcode: off.barcode,
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
      rawData: off.rawData,
      createdAt: new Date(),
      updatedAt: off.offLastModified ? new Date(off.offLastModified * 1000) : new Date(),
    };
  }

  /**
   * Fetch product details by barcode from OpenFoodFacts with selective fields and resilient normalization
   */
  static async getByBarcode(barcode: string): Promise<NormalizedOffProduct | null> {
    try {
      const cleanBarcode = barcode.trim();
      const url = `${this.BASE_URL}/api/v2/product/${cleanBarcode}.json?fields=${this.TARGET_FIELDS}`;
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

      // Helper to parse numeric nutrition, differentiating 0 from missing (null)
      const parseNutrient = (key100: string, keyServing?: string): number | null => {
        if (n[key100] !== undefined && n[key100] !== null && n[key100] !== '') {
          const val = Number(n[key100]);
          return isNaN(val) ? null : val;
        }
        if (keyServing && n[keyServing] !== undefined && n[keyServing] !== null && n[keyServing] !== '') {
          const val = Number(n[keyServing]);
          return isNaN(val) ? null : val;
        }
        return null;
      };

      // 1. Calorie / Energy
      let energy = parseNutrient('energy-kcal_100g', 'energy-kcal_serving');
      if (energy === null) {
        // Fallback from kJ if kcal is missing (1 kcal = 4.184 kJ)
        const energyKj = parseNutrient('energy_100g', 'energy_serving');
        if (energyKj !== null) {
          energy = Math.round(energyKj / 4.184);
        }
      }

      // 2. Diabetes core parameters
      const carbs = parseNutrient('carbohydrates_100g', 'carbohydrates_serving');
      const sugars = parseNutrient('sugars_100g', 'sugars_serving');
      const fiber = parseNutrient('fiber_100g', 'fiber_serving');
      const proteins = parseNutrient('proteins_100g', 'proteins_serving');
      const fat = parseNutrient('fat_100g', 'fat_serving');
      const saturatedFat = parseNutrient('saturated-fat_100g', 'saturated-fat_serving');

      // 3. Hypertension core parameters (Sodium in mg & Salt in g)
      let rawSodium = parseNutrient('sodium_100g', 'sodium_serving'); // typically grams in OFF
      let rawSalt = parseNutrient('salt_100g', 'salt_serving'); // grams in OFF

      let sodiumMg: number | null = null;
      let saltG: number | null = null;

      if (rawSodium !== null) {
        sodiumMg = Math.round(rawSodium * 1000);
        saltG = rawSalt !== null ? Number(rawSalt.toFixed(2)) : Number(((sodiumMg * 2.5) / 1000).toFixed(2));
      } else if (rawSalt !== null) {
        saltG = Number(rawSalt.toFixed(2));
        sodiumMg = Math.round((rawSalt / 2.5) * 1000);
      }

      // 4. Data Quality / Completeness Check
      // Critical fields for Darkim's dual health profile: Sugars (Diabetes) and Sodium/Salt (Hypertension)
      const hasDiabetesData = sugars !== null || carbs !== null;
      const hasHypertensionData = sodiumMg !== null || saltG !== null;
      const isNutritionComplete = Boolean(hasDiabetesData && hasHypertensionData);

      // Score based on presence of 6 major nutrients: energy, carbs, sugars, fat, proteins, sodium
      const evaluatedFields = [energy, carbs, sugars, fat, proteins, sodiumMg];
      const filledCount = evaluatedFields.filter((v) => v !== null).length;
      const nutritionCompletenessScore = Math.round((filledCount / evaluatedFields.length) * 100);

      return {
        barcode: cleanBarcode,
        name: p.product_name_id || p.product_name || p.product_name_en || 'Produk Tanpa Nama',
        brand: p.brands || 'Tanpa Brand',
        category: p.categories_tags?.[0]?.replace(/^id:|^en:/, '') || p.categories || 'Makanan & Minuman',
        energy,
        carbohydrates: carbs,
        sugars,
        fiber,
        proteins,
        fat,
        saturatedFat,
        sodium: sodiumMg,
        salt: saltG,
        image: p.image_front_url || p.image_url || null,
        isNutritionComplete,
        nutritionCompletenessScore,
        offLastModified: p.last_modified_t ? Number(p.last_modified_t) : null,
        rawData: {
          nutriments: n,
          serving_size: p.serving_size,
          last_modified_t: p.last_modified_t,
        },
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

  /**
   * Determine the API base URL for Write/Contribute operations (Production vs Staging)
   */
  static getWriteBaseUrl(): string {
    const env = (process.env.OFF_ENV || 'staging').toLowerCase();
    return env === 'production'
      ? 'https://world.openfoodfacts.org'
      : 'https://world.openfoodfacts.net';
  }

  /**
   * Determine contributor credentials from environment
   */
  static getCredentials(customCreds?: { userId?: string; password?: string }): { userId: string; password: string } {
    const isProduction = (process.env.OFF_ENV || 'staging').toLowerCase() === 'production';
    const userId = customCreds?.userId || process.env.OFF_USER_ID || (isProduction ? '' : 'off');
    const password = customCreds?.password || process.env.OFF_PASSWORD || (isProduction ? '' : 'off');
    return { userId, password };
  }

  /**
   * Write or correct product data to Open Food Facts using the official CGI Write API (product_jqm2.pl)
   */
  static async writeProduct(
    data: OffWriteProductData,
    customCreds?: { userId?: string; password?: string }
  ): Promise<OffWriteResult> {
    const baseUrl = this.getWriteBaseUrl();
    const env: 'staging' | 'production' = baseUrl.includes('.org') ? 'production' : 'staging';
    const creds = this.getCredentials(customCreds);

    try {
      const barcode = data.barcode.trim();
      if (!barcode) {
        return {
          success: false,
          status: 0,
          message: 'Barcode wajib disertakan untuk Open Food Facts.',
          environment: env,
        };
      }

      const params = new URLSearchParams();
      params.append('code', barcode);
      params.append('user_id', creds.userId);
      params.append('password', creds.password);

      // Basic product information
      if (data.name) params.append('product_name', data.name.trim());
      if (data.brand) params.append('brands', data.brand.trim());
      if (data.category) params.append('categories', data.category.trim());
      if (data.servingSize) params.append('serving_size', data.servingSize.trim());

      // Nutritional parameters (per 100g standard)
      if (data.energy !== undefined && data.energy !== null) {
        params.append('nutriment_energy-kcal', String(data.energy));
        params.append('nutriment_energy-kcal_unit', 'kcal');
      }
      if (data.carbohydrates !== undefined && data.carbohydrates !== null) {
        params.append('nutriment_carbohydrates', String(data.carbohydrates));
        params.append('nutriment_carbohydrates_unit', 'g');
      }
      if (data.sugars !== undefined && data.sugars !== null) {
        params.append('nutriment_sugars', String(data.sugars));
        params.append('nutriment_sugars_unit', 'g');
      }
      if (data.fiber !== undefined && data.fiber !== null) {
        params.append('nutriment_fiber', String(data.fiber));
        params.append('nutriment_fiber_unit', 'g');
      }
      if (data.proteins !== undefined && data.proteins !== null) {
        params.append('nutriment_proteins', String(data.proteins));
        params.append('nutriment_proteins_unit', 'g');
      }
      if (data.fat !== undefined && data.fat !== null) {
        params.append('nutriment_fat', String(data.fat));
        params.append('nutriment_fat_unit', 'g');
      }
      if (data.saturatedFat !== undefined && data.saturatedFat !== null) {
        params.append('nutriment_saturated-fat', String(data.saturatedFat));
        params.append('nutriment_saturated-fat_unit', 'g');
      }

      // Convert sodium from mg to g as required by OpenFoodFacts per 100g
      if (data.sodium !== undefined && data.sodium !== null) {
        const sodiumGrams = Number((data.sodium / 1000).toFixed(4));
        params.append('nutriment_sodium', String(sodiumGrams));
        params.append('nutriment_sodium_unit', 'g');
      }
      if (data.salt !== undefined && data.salt !== null) {
        params.append('nutriment_salt', String(data.salt));
        params.append('nutriment_salt_unit', 'g');
      }

      params.append('comment', 'Updated via DARKIM Food & Nutrition Assistant');

      const url = `${baseUrl}/cgi/product_jqm2.pl`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DARKIM-NutritionApp/1.0 (https://github.com/darkim-project; contact@darkim.id)',
        },
        body: params.toString(),
        signal: AbortSignal.timeout(10000),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        if (text.includes('status: 1') || text.includes('fields saved') || text.includes('product updated')) {
          return {
            success: true,
            status: 1,
            message: `Data produk berhasil disimpan di Open Food Facts (${env}).`,
            environment: env,
          };
        }
        return {
          success: false,
          status: 0,
          message: `Open Food Facts mengembalikan HTML. Periksa akun/password (${creds.userId || 'anonim'}).`,
          environment: env,
        };
      }

      const json = await res.json();
      if (json && (json.status === 1 || json.status_verbose === 'fields saved')) {
        return {
          success: true,
          status: 1,
          message: json.status_verbose || `Berhasil memperbarui data produk di Open Food Facts (${env}).`,
          environment: env,
          rawResponse: json,
        };
      }

      return {
        success: false,
        status: json?.status || 0,
        message: json?.status_verbose || 'Gagal menyimpan perubahan ke Open Food Facts.',
        environment: env,
        rawResponse: json,
      };
    } catch (err: any) {
      console.error('[OpenFoodFacts] Write error:', err);
      return {
        success: false,
        status: 0,
        message: `Koneksi ke Open Food Facts gagal: ${err?.message || 'Timeout'}`,
        environment: env,
      };
    }
  }

  /**
   * Upload product packaging photo (front, nutrition, or ingredients)
   */
  static async uploadProductPhoto(
    barcode: string,
    imageBlob: Blob,
    imageField: 'front' | 'nutrition' | 'ingredients' = 'front',
    filename = 'photo.jpg',
    customCreds?: { userId?: string; password?: string }
  ): Promise<OffWriteResult> {
    const baseUrl = this.getWriteBaseUrl();
    const env: 'staging' | 'production' = baseUrl.includes('.org') ? 'production' : 'staging';
    const creds = this.getCredentials(customCreds);

    try {
      const cleanBarcode = barcode.trim();
      const formData = new FormData();
      formData.append('code', cleanBarcode);
      formData.append('imagefield', imageField);
      formData.append(`imgupload_${imageField}`, imageBlob, filename);
      formData.append('user_id', creds.userId);
      formData.append('password', creds.password);

      const url = `${baseUrl}/cgi/product_image_upload.pl`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'DARKIM-NutritionApp/1.0 (https://github.com/darkim-project; contact@darkim.id)',
        },
        body: formData,
        signal: AbortSignal.timeout(15000),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        if (text.includes('status: 1') || text.includes('image uploaded') || text.includes('status_verbose')) {
          return {
            success: true,
            status: 1,
            message: `Foto ${imageField} berhasil diunggah ke Open Food Facts (${env}).`,
            environment: env,
          };
        }
        return {
          success: false,
          status: 0,
          message: 'Gagal mengunggah foto. Pastikan format gambar dan kredensial benar.',
          environment: env,
        };
      }

      const json = await res.json();
      const isSuccess = json?.status === 'status ok' || json?.status === 1 || json?.imagefield;
      return {
        success: Boolean(isSuccess),
        status: isSuccess ? 1 : 0,
        message: json?.status_verbose || (isSuccess ? `Foto berhasil diunggah ke Open Food Facts (${env}).` : 'Gagal mengunggah foto.'),
        environment: env,
        rawResponse: json,
      };
    } catch (err: any) {
      console.error('[OpenFoodFacts] Image upload error:', err);
      return {
        success: false,
        status: 0,
        message: `Gagal mengunggah foto ke Open Food Facts: ${err?.message || 'Timeout'}`,
        environment: env,
      };
    }
  }
}

