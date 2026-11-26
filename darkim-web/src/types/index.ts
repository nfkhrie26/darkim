export type HealthProfile = 'hipertensi' | 'diabetes';

export type NutritionStatusColor = 'green' | 'yellow' | 'red' | 'white';

export interface NutritionStatusItem {
  zat: string;
  status: string;
  statusColor: NutritionStatusColor;
  jumlah: string;
}

export interface NutritionTableItem {
  zat: string;
  jumlah: string;
}

export interface NutritionEvaluation {
  profile: HealthProfile;
  badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' | 'DATA TIDAK LENGKAP';
  badgeBg: string;
  isDataIncomplete?: boolean;
  nutritionBasis?: string | null;
  safePoints: string[];
  warningPoints: string[];
  statusTable: NutritionStatusItem[];
  nutritionTable: NutritionTableItem[];
}

export interface ProductModel {
  id: string;
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
  sodium?: number | null;
  salt?: number | null;
  cholesterol?: number | null;
  calcium?: number | null;
  image?: string | null;
  rawData?: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TicketModel {
  id: string;
  barcode: string;
  description?: string | null;
  frontPhoto?: string | null;
  nutritionPhoto?: string | null;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  resolutionMethod?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ScanApiResponse {
  success: boolean;
  barcode?: string;
  product?: ProductModel;
  evaluation?: NutritionEvaluation;
  notFound?: boolean;
  message?: string;
  stage?: string;
  time_ms?: number;
}

export interface CatalogProductItem {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image?: string | null;
}

export interface CatalogSearchResponse {
  success: boolean;
  source: 'openfoodfacts' | 'local-fallback';
  products: CatalogProductItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  message?: string;
}

