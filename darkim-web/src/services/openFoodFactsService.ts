import { CatalogProductItem, ProductModel } from '@/types';
import {
  getPer100ConversionFactor,
  parseServingQuantity,
  scaleNutrientToPer100,
} from '@/lib/nutritionConversion';

export interface NormalizedOffProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  servingSize?: string | null;
  nutritionBasis?: string | null;
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
  private static SEARCH_URL = 'https://search.openfoodfacts.org/search';

  private static CATALOG_FIELDS = [
    'code',
    'product_name',
    'product_name_id',
    'product_name_en',
    'brands',
    'categories',
    'categories_tags',
    'image_front_small_url',
    'image_front_url',
    'image_url',
  ].join(',');

  // Request only essential fields from OFF to reduce payload by up to 90% and speed up response
  private static TARGET_FIELDS = [
    'code',
    'product_name',
    'product_name_id',
    'product_name_en',
    'brands',
    'categories',
    'categories_tags',
    'countries_tags',
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
      servingSize: off.servingSize,
      nutritionBasis: off.nutritionBasis,
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
      const servingSizeStr = p.serving_size ? String(p.serving_size).trim() : null;
      const servingQty = parseServingQuantity(servingSizeStr);

      const hasValidNum = (key: string): boolean =>
        n[key] !== undefined && n[key] !== null && n[key] !== '' && !isNaN(Number(n[key]));

      // Opsi A: Prefer consistent per-serving basis whenever serving_size and *_serving data exist
      const hasServingData =
        Boolean(servingSizeStr) &&
        [
          'energy-kcal_serving',
          'energy_serving',
          'carbohydrates_serving',
          'sugars_serving',
          'fat_serving',
          'saturated-fat_serving',
          'proteins_serving',
          'sodium_serving',
          'salt_serving',
        ].some(hasValidNum);

      const nutritionBasis = hasServingData && servingSizeStr
        ? `per ${servingSizeStr}`
        : 'per 100g / 100ml';

      // Helper to read a single consistent basis (serving-first when hasServingData, else strictly _100g)
      const parseNutrient = (key100: string, keyServing: string): number | null => {
        if (hasServingData) {
          if (hasValidNum(keyServing)) {
            return Number(Number(n[keyServing]).toFixed(5));
          }
          // Scale _100g consistently to serving basis if only _100g is present
          if (hasValidNum(key100) && servingQty && servingQty > 0) {
            return Number(((Number(n[key100]) * servingQty) / 100).toFixed(5));
          }
          return null;
        }
        return hasValidNum(key100) ? Number(Number(n[key100]).toFixed(5)) : null;
      };

      // 1. Calorie / Energy
      let energy = parseNutrient('energy-kcal_100g', 'energy-kcal_serving');
      if (energy === null) {
        // Fallback from kJ if kcal is missing (1 kcal = 4.184 kJ)
        const energyKj = parseNutrient('energy_100g', 'energy_serving');
        if (energyKj !== null) {
          energy = Number((energyKj / 4.184).toFixed(1));
        }
      } else {
        energy = Number(energy.toFixed(1));
      }

      // 2. Diabetes core parameters
      const round2 = (v: number | null) => (v !== null ? Number(v.toFixed(2)) : null);
      const carbs = round2(parseNutrient('carbohydrates_100g', 'carbohydrates_serving'));
      const sugars = round2(parseNutrient('sugars_100g', 'sugars_serving'));
      const fiber = round2(parseNutrient('fiber_100g', 'fiber_serving'));
      const proteins = round2(parseNutrient('proteins_100g', 'proteins_serving'));
      const fat = round2(parseNutrient('fat_100g', 'fat_serving'));
      const saturatedFat = round2(parseNutrient('saturated-fat_100g', 'saturated-fat_serving'));

      // 3. Hypertension core parameters (Sodium in mg & Salt in g)
      const rawSodium = parseNutrient('sodium_100g', 'sodium_serving'); // typically grams in OFF
      const rawSalt = parseNutrient('salt_100g', 'salt_serving'); // grams in OFF

      let sodiumMg: number | null = null;
      let saltG: number | null = null;

      if (rawSodium !== null) {
        sodiumMg = Number((rawSodium * 1000).toFixed(1));
        saltG = rawSalt !== null ? Number(rawSalt.toFixed(2)) : Number(((sodiumMg * 2.5) / 1000).toFixed(2));
      } else if (rawSalt !== null) {
        saltG = Number(rawSalt.toFixed(2));
        sodiumMg = Number(((rawSalt / 2.5) * 1000).toFixed(1));
      }

      // 4. Data Quality / Completeness Check
      const hasDiabetesData = sugars !== null || carbs !== null;
      const hasHypertensionData = sodiumMg !== null || saltG !== null;
      const isNutritionComplete = Boolean(hasDiabetesData && hasHypertensionData);

      const evaluatedFields = [energy, carbs, sugars, fat, proteins, sodiumMg];
      const filledCount = evaluatedFields.filter((v) => v !== null).length;
      const nutritionCompletenessScore = Math.round((filledCount / evaluatedFields.length) * 100);

      const rawTags: string[] = Array.isArray(p.categories_tags) ? p.categories_tags : [];
      const productName = p.product_name_id || p.product_name || p.product_name_en || 'Produk Tanpa Nama';
      const { category: resolvedCategory } = this.resolveIndonesianCategory(
        productName,
        rawTags,
        typeof p.categories === 'string' ? p.categories : ''
      );

      return {
        barcode: cleanBarcode,
        name: productName,
        brand: p.brands || 'Tanpa Brand',
        category: resolvedCategory,
        servingSize: servingSizeStr,
        nutritionBasis,
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
          countries_tags: p.countries_tags,
          last_modified_t: p.last_modified_t,
        },
      };
    } catch (err) {
      console.warn(`[OpenFoodFacts] Failed fetching barcode ${barcode}:`, err);
      return null;
    }
  }

  /**
   * Intelligently classify product category into clean Indonesian labels
   * and accurately detect whether it is a beverage (Minuman) or food (Makanan).
   */
  static resolveIndonesianCategory(
    name: string,
    rawTags: string[] = [],
    rawCategoriesStr: string = ''
  ): {
    category: string;
    isBeverage: boolean;
  } {
    const cleanName = (name || '').trim().toLowerCase();
    const categoriesLower = (rawCategoriesStr || '').toLowerCase();
    const tagString = rawTags.join(' ').toLowerCase();
    const combined = `${cleanName} ${categoriesLower} ${tagString}`;

    // Obvious food keyword check (overrides accidental beverage tags, e.g. plant-based-foods-and-beverages)
    const isObviousFood =
      /\b(mi|mie|bihun|kwetiau|ramen|noodle|pasta|spaghetti|makaroni|biskuit|biscuit|cookie|wafer|keripik|kripik|kerupuk|chips|crisps|snack|mentega|butter|keju|cheese|margarine|cokelat|chocolate|permen|candy|saus|sauce|kecap|sambal|bumbu|seasoning|minyak|oil|beras|rice|roti|bread|cake|kue|pie|sereal|cereal|oat|granola|daging|meat|sosis|sausage|nugget|bakso|ikan|fish|seafood)\b/i.test(
        cleanName
      ) ||
      rawTags.some((t) =>
        /noodles|pastas|biscuits|cakes|breads|salty-snacks|sweet-snacks|appetizers|crisps|chips|spreads|butters|cheeses|fats|vegetable-oils|condiments|sauces|cereals|meats|seafood/i.test(
          t
        )
      );

    // True beverage check (avoids 'plant-based-foods-and-beverages' false positive)
    const hasBeverageTag = rawTags.some((t) => {
      const tag = t.toLowerCase();
      if (tag === 'en:plant-based-foods-and-beverages' || tag === 'plant-based-foods-and-beverages') {
        return false;
      }
      return (
        tag === 'en:beverages' ||
        tag.startsWith('en:beverages') ||
        tag === 'en:waters' ||
        tag.includes('waters') ||
        tag.includes('soft-drinks') ||
        tag.includes('sodas') ||
        tag.includes('teas') ||
        tag.includes('coffees') ||
        tag.includes('fruit-juices') ||
        tag.includes('plant-milks') ||
        tag.includes('dairy-drinks')
      );
    });

    const isBeverageByName =
      /^(air mineral|teh|kopi|jus|sirup|susu|minuman|soda|beer|bir)\b/i.test(cleanName) ||
      /\b(mineral water|air minum|drinking water|iced tea|coffee drink|sparkling water|energy drink|soft drink|syrup)\b/i.test(
        cleanName
      );

    const isBeverage = (hasBeverageTag || isBeverageByName) && !isObviousFood;

    let category = 'Makanan Kemasan';

    if (isBeverage) {
      if (/water|air mineral|aqua|le minerale|air minum/i.test(combined)) {
        category = 'Air Mineral';
      } else if (/tea|teh/i.test(combined)) {
        category = 'Minuman Teh';
      } else if (/coffee|kopi/i.test(combined)) {
        category = 'Minuman Kopi';
      } else if (/milk|susu|oat milk|soy milk|almond milk/i.test(combined)) {
        category = 'Susu & Minuman Susu';
      } else if (/juice|jus|sari buah/i.test(combined)) {
        category = 'Jus Buah';
      } else if (/soda|carbonated|soft drink|cola/i.test(combined)) {
        category = 'Minuman Bersoda';
      } else {
        category = 'Minuman';
      }
    } else {
      if (/noodle|mie|mi |bihun|kwetiau|pasta|spaghetti|ramen/i.test(combined)) {
        category = 'Mie & Pasta';
      } else if (/biscuit|biskuit|cookie|wafer|cake|kue|pie|roti|bread/i.test(combined)) {
        category = 'Biskuit & Kue';
      } else if (/snack|chips|crisps|keripik|kripik|kerupuk|ciki|popcorn/i.test(combined)) {
        category = 'Camilan / Makanan Ringan';
      } else if (/chocolate|cokelat|candy|permen|confectionery/i.test(combined)) {
        category = 'Cokelat & Permen';
      } else if (/butter|mentega|cheese|keju|margarine|dairy|dairies|laitier|beurre/i.test(combined)) {
        category = 'Olahan Susu & Mentega';
      } else if (/oil|minyak|sauce|saus|kecap|sambal|condiment|seasoning|bumbu/i.test(combined)) {
        category = 'Minyak & Bumbu Dapur';
      } else if (/cereal|sereal|oat|granola|rice|beras/i.test(combined)) {
        category = 'Sereal & Biji-bijian';
      } else if (/meat|daging|sosis|sausage|seafood|ikan|nugget/i.test(combined)) {
        category = 'Daging & Olahan';
      } else {
        const cleanTag = rawTags[rawTags.length - 1]?.replace(/^[a-z]{2}:/i, '').replace(/-/g, ' ');
        if (cleanTag && cleanTag !== 'plant based foods and beverages' && cleanTag.length < 24) {
          category = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1);
        } else {
          category = 'Makanan Kemasan';
        }
      }
    }

    return { category, isBeverage };
  }

  /**
   * Normalize raw OpenFoodFacts search hit/product into a clean CatalogProductItem
   */
  private static normalizeCatalogItem(raw: any): CatalogProductItem {
    const barcode = String(raw?.code || '').trim();
    const rawBrands = Array.isArray(raw?.brands)
      ? raw.brands.map((b: string) => String(b).replace(/^[a-z]{2}:/i, '')).join(', ')
      : String(raw?.brands || '').trim();

    const tags: string[] = Array.isArray(raw?.categories_tags)
      ? raw.categories_tags
      : Array.isArray(raw?.categories)
      ? raw.categories
      : [];

    const name = raw?.product_name_id || raw?.product_name || raw?.product_name_en || 'Produk Tanpa Nama';
    const rawCatStr = typeof raw?.categories === 'string' ? raw.categories : '';

    const { category } = this.resolveIndonesianCategory(name, tags, rawCatStr);

    return {
      id: barcode,
      barcode,
      name,
      brand: rawBrands || 'Tanpa Brand',
      category,
      image: raw?.image_front_url || raw?.image_front_small_url || raw?.image_url || null,
    };
  }

  /**
   * Fetch paginated catalog products directly from OpenFoodFacts (GET)
   * Uses Search-a-licious (search.openfoodfacts.org) for ~10ms responses with Indonesia priority + global fallback.
   * Returns null when OpenFoodFacts is unreachable so callers can fall back cleanly to local PostgreSQL.
   */
  static async searchCatalog(options: {
    query?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    products: CatalogProductItem[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null> {
    const cleanQuery = (options.query || '').trim();
    const category = (options.category || 'all').toLowerCase();
    const page = Math.max(1, Number(options.page) || 1);
    const pageSize = Math.min(24, Math.max(1, Number(options.pageSize) || 6));

    // 1. Direct barcode lookup when user inputs an 8-14 digit EAN/UPC code (strictly Indonesia market)
    if (/^\d{8,14}$/.test(cleanQuery)) {
      const exact = await this.getByBarcode(cleanQuery);
      const countriesTags: string[] = Array.isArray(exact?.rawData?.countries_tags)
        ? exact.rawData.countries_tags
        : [];
      const isIndonesianMarket =
        cleanQuery.startsWith('899') ||
        countriesTags.some((t) => t.toLowerCase().includes('indonesia'));

      if (!exact || !isIndonesianMarket) {
        return { products: [], page: 1, pageSize, totalCount: 0, totalPages: 1 };
      }
      return {
        products: [
          {
            id: exact.barcode,
            barcode: exact.barcode,
            name: exact.name,
            brand: exact.brand,
            category: exact.category,
            image: exact.image,
          },
        ],
        page: 1,
        pageSize,
        totalCount: 1,
        totalPages: 1,
      };
    }

    try {
      const clauses: string[] = [];
      if (cleanQuery.length > 0) {
        // Strip Lucene special colons/quotes in user free-text to prevent 400 QueryCheckError
        const safeText = cleanQuery.replace(/[:"]/g, ' ').trim();
        if (safeText) clauses.push(safeText);
      }
      // Strictly filter catalog to Indonesian & imported products available in Indonesia
      clauses.push('countries:"en:indonesia"');

      if (category === 'minuman') {
        clauses.push('categories:"en:beverages"');
      } else if (category === 'makanan') {
        clauses.push('-categories:"en:beverages"');
      }

      const params = new URLSearchParams({
        q: clauses.join(' '),
        sort_by: '-unique_scans_n',
        page: String(page),
        page_size: String(pageSize),
        fields: this.CATALOG_FIELDS,
      });

      const res = await fetch(`${this.SEARCH_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'DARKIM-NutritionApp/1.0 (https://github.com/darkim-project)',
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(7000),
      });

      if (!res.ok) return null;
      const data = await res.json();

      const rawHits: any[] = Array.isArray(data?.hits) ? data.hits : [];
      let products = rawHits
        .map((item) => this.normalizeCatalogItem(item))
        .filter((p) => Boolean(p.barcode));

      // Strictly ensure category separation matches true beverage/food classification
      if (category === 'minuman') {
        products = products.filter((p) => {
          const hit = rawHits.find((h) => String(h?.code).trim() === p.barcode);
          const tags = Array.isArray(hit?.categories_tags) ? hit.categories_tags : [];
          return this.resolveIndonesianCategory(p.name, tags, typeof hit?.categories === 'string' ? hit.categories : '').isBeverage;
        });
      } else if (category === 'makanan') {
        products = products.filter((p) => {
          const hit = rawHits.find((h) => String(h?.code).trim() === p.barcode);
          const tags = Array.isArray(hit?.categories_tags) ? hit.categories_tags : [];
          return !this.resolveIndonesianCategory(p.name, tags, typeof hit?.categories === 'string' ? hit.categories : '').isBeverage;
        });
      }

      const totalCount = Number(data?.count || products.length);
      const totalPages = Math.min(1000, Math.max(1, Math.ceil(totalCount / pageSize)));

      return { products, page, pageSize, totalCount, totalPages };
    } catch (err) {
      console.warn(`[OpenFoodFacts] searchCatalog failed for '${cleanQuery}':`, err);
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

      // Basic product information (tag Indonesia automatically for new/updated products)
      if (data.name) params.append('product_name', data.name.trim());
      if (data.brand) params.append('brands', data.brand.trim());
      if (data.category) params.append('categories', data.category.trim());
      params.append('countries', 'Indonesia');
      if (data.servingSize) params.append('serving_size', data.servingSize.trim());

      // Convert nutrient values dynamically from user-entered servingSize (e.g., per 250 ml) -> OFF canonical per 100g/100ml
      const { factor } = getPer100ConversionFactor(data.servingSize);
      params.append('nutrition_data_per', '100g');

      const convEnergy = scaleNutrientToPer100(data.energy, factor, 2);
      const convCarbs = scaleNutrientToPer100(data.carbohydrates, factor, 2);
      const convSugars = scaleNutrientToPer100(data.sugars, factor, 2);
      const convFiber = scaleNutrientToPer100(data.fiber, factor, 2);
      const convProteins = scaleNutrientToPer100(data.proteins, factor, 2);
      const convFat = scaleNutrientToPer100(data.fat, factor, 2);
      const convSatFat = scaleNutrientToPer100(data.saturatedFat, factor, 2);
      const convSodiumMg = scaleNutrientToPer100(data.sodium, factor, 2);
      let convSalt = scaleNutrientToPer100(data.salt, factor, 4);
      if (convSalt === undefined && convSodiumMg !== undefined) {
        convSalt = Number(((convSodiumMg * 2.5) / 1000).toFixed(4));
      }

      // Format exact zero as '0.0' so Perl CGI product_jqm2.pl treats it as truthy instead of dropping falsy '0'
      const appendNutriment = (key: string, val: number | undefined, unit: string) => {
        if (val === undefined || isNaN(val)) return;
        params.append(`nutriment_${key}`, val === 0 ? '0.0' : String(val));
        params.append(`nutriment_${key}_unit`, unit);
      };

      const sodiumGrams =
        convSodiumMg !== undefined ? Number((convSodiumMg / 1000).toFixed(5)) : undefined;

      // Nutritional parameters (per 100g/100ml standard)
      appendNutriment('energy-kcal', convEnergy, 'kcal');
      appendNutriment('carbohydrates', convCarbs, 'g');
      appendNutriment('sugars', convSugars, 'g');
      appendNutriment('fiber', convFiber, 'g');
      appendNutriment('proteins', convProteins, 'g');
      appendNutriment('fat', convFat, 'g');
      appendNutriment('saturated-fat', convSatFat, 'g');
      appendNutriment('sodium', sodiumGrams, 'g');
      appendNutriment('salt', convSalt, 'g');

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

