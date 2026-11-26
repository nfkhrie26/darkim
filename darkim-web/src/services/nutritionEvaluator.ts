import { HealthProfile, NutritionEvaluation, NutritionStatusColor, NutritionStatusItem, NutritionTableItem, ProductModel } from '@/types';

const NOT_FOUND_STATUS = 'TIDAK DITEMUKAN';

/**
 * Build a status row uniformly, returning white 'TIDAK DITEMUKAN' when value is missing (null).
 */
function buildStatusRow(
  zat: string,
  value: number | null,
  formattedAmount: string,
  evaluate: (val: number) => { status: string; statusColor: NutritionStatusColor }
): NutritionStatusItem {
  if (value === null) {
    return {
      zat,
      status: NOT_FOUND_STATUS,
      statusColor: 'white',
      jumlah: 'Tidak tersedia',
    };
  }
  const { status, statusColor } = evaluate(value);
  return { zat, status, statusColor, jumlah: formattedAmount };
}

/**
 * Isolated Nutrition Evaluation Service
 * Evaluates food/drink products based on health profiles (Hipertensi vs Diabetes Melitus).
 * Gracefully handles incomplete or legacy crowdsourced data.
 */
export function evaluateNutrition(product: Partial<ProductModel>, profile: HealthProfile): NutritionEvaluation {
  const energy = product.energy ?? null;
  const carbs = product.carbohydrates ?? null;
  const sugars = product.sugars ?? null;
  const fiber = product.fiber ?? null;
  const proteins = product.proteins ?? null;
  const fat = product.fat ?? null;
  const satFat = product.saturatedFat ?? null;
  const sodium = product.sodium ?? null;
  const salt = product.salt ?? (sodium !== null ? Number(((sodium * 2.5) / 1000).toFixed(2)) : null);

  const servingFromRaw = product.rawData?.serving_size ? `per ${product.rawData.serving_size}` : null;
  const nutritionBasis =
    product.nutritionBasis ||
    (product.servingSize ? `per ${product.servingSize}` : servingFromRaw) ||
    'per 100g / 100ml';

  const formatVal = (val: number | null, unit: string) => (val !== null ? `${val} ${unit}` : 'Tidak tersedia');

  // Shared complete combined nutrition table (Diabetes + Hipertensi nutrients)
  const fullNutritionTable: NutritionTableItem[] = [
    { zat: 'Kalori', jumlah: formatVal(energy, 'kkal') },
    { zat: 'Karbohidrat', jumlah: formatVal(carbs, 'g') },
    { zat: 'Gula', jumlah: formatVal(sugars, 'g') },
    { zat: 'Serat Pangan', jumlah: formatVal(fiber, 'g') },
    { zat: 'Protein', jumlah: formatVal(proteins, 'g') },
    { zat: 'Lemak Total', jumlah: formatVal(fat, 'g') },
    { zat: 'Lemak Jenuh', jumlah: formatVal(satFat, 'g') },
    { zat: 'Natrium', jumlah: formatVal(sodium, 'mg') },
    { zat: 'Garam', jumlah: salt !== null ? `${salt.toFixed(2)} g` : 'Tidak tersedia' },
  ];

  const satFatRow = buildStatusRow('Lemak Jenuh', satFat, formatVal(satFat, 'g'), (v) => ({
    status: v > 3 ? 'WASPADA GULA' : 'AMAN',
    statusColor: v > 3 ? 'yellow' : 'green',
  }));
  const proteinRow = buildStatusRow('Protein', proteins, formatVal(proteins, 'g'), () => ({
    status: 'AMAN',
    statusColor: 'green',
  }));
  const energyRow = (label: string) =>
    buildStatusRow(label, energy, formatVal(energy, 'kkal'), (v) => ({
      status: v > 250 ? 'WASPADA GULA' : 'AMAN',
      statusColor: v > 250 ? 'yellow' : 'green',
    }));

  if (profile === 'diabetes') {
    // ----------------------------------------------------
    // DIABETES MELITUS EVALUATION LOGIC
    // ----------------------------------------------------
    const safePoints: string[] = [];
    const warningPoints: string[] = [];

    if (sugars === null && carbs === null) {
      warningPoints.push('Data kandungan gula dan karbohidrat tidak tercantum pada database.');
      warningPoints.push('Disarankan memeriksa tabel informasi nilai gizi pada kemasan fisik sebelum dikonsumsi.');

      return {
        profile,
        badge: 'DATA TIDAK LENGKAP',
        badgeBg: '#94A3B8',
        isDataIncomplete: true,
        nutritionBasis,
        safePoints: ['Produk terdaftar di sistem, namun data rincian gizi belum lengkap.'],
        warningPoints,
        statusTable: [
          buildStatusRow('Gula', null, 'Tidak tersedia', () => ({ status: 'AMAN', statusColor: 'green' })),
          buildStatusRow('Karbohidrat', null, 'Tidak tersedia', () => ({ status: 'AMAN', statusColor: 'green' })),
          satFatRow,
          proteinRow,
          buildStatusRow('Kalori Total', energy, formatVal(energy, 'kkal'), () => ({ status: 'AMAN', statusColor: 'green' })),
        ],
        nutritionTable: fullNutritionTable,
      };
    }

    let badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' = 'AMAN';
    let badgeBg = '#00D084';

    const sugarRow = buildStatusRow('Gula', sugars, formatVal(sugars, 'g'), (v) => {
      if (v > 15) {
        badge = 'TIDAK AMAN';
        badgeBg = '#FF4D4D';
        warningPoints.push(`Kandungan Gula Sangat Tinggi (${v} g). Berisiko memicu lonjakan glukosa darah.`);
        return { status: 'TIDAK AMAN', statusColor: 'red' };
      }
      if (v > 6) {
        badge = 'HATI-HATI';
        badgeBg = '#FFD027';
        warningPoints.push(`Kandungan Gula Sedang (${v} g). Perlu pembatasan porsi konsumsi harian.`);
        return { status: 'WASPADA GULA', statusColor: 'yellow' };
      }
      safePoints.push(`Kadar Gula Rendah (${v} g). Ramah untuk pemeliharaan kadar gula darah.`);
      return { status: 'AMAN', statusColor: 'green' };
    });

    if (sugars === null) {
      warningPoints.push('Kadar gula spesifik tidak tercantum terpisah.');
    }

    const carbRow = buildStatusRow('Karbohidrat', carbs, formatVal(carbs, 'g'), (v) => {
      if (v > 35) {
        if (badge !== 'TIDAK AMAN') {
          badge = 'TIDAK AMAN';
          badgeBg = '#FF4D4D';
        }
        warningPoints.push(`Karbohidrat Tinggi (${v} g). Dapat meningkatkan beban glikemik secara bertahap.`);
        return { status: 'TIDAK AMAN', statusColor: 'red' };
      }
      if (v > 20) {
        if (badge === 'AMAN') {
          badge = 'HATI-HATI';
          badgeBg = '#FFD027';
        }
        return { status: 'WASPADA GULA', statusColor: 'yellow' };
      }
      safePoints.push(`Karbohidrat Terkontrol (${v} g).`);
      return { status: 'AMAN', statusColor: 'green' };
    });

    if (fiber !== null && fiber >= 2) {
      safePoints.push(`Mengandung Serat Pangan (${fiber} g) yang membantu memperlambat penyerapan glukosa.`);
    }
    if (proteins !== null && proteins >= 5) {
      safePoints.push(`Kandungan Protein Alami (${proteins} g) menunjang perbaikan sel dan rasa kenyang stabil.`);
    }
    if (sodium !== null && sodium <= 120) {
      safePoints.push(`Natrium Rendah (${sodium} mg), aman untuk organ ginjal penderita diabetes.`);
    }

    if (warningPoints.length === 0) {
      warningPoints.push('Tetap perhatikan takaran saji dan konsultasikan pola makan dengan dokter/ahli gizi.');
    }

    return {
      profile,
      badge,
      badgeBg,
      nutritionBasis,
      safePoints,
      warningPoints,
      statusTable: [
        sugarRow,
        carbRow,
        satFatRow,
        proteinRow,
        energyRow('Kalori Total'),
      ],
      nutritionTable: fullNutritionTable,
    };
  } else {
    // ----------------------------------------------------
    // HIPERTENSI EVALUATION LOGIC
    // ----------------------------------------------------
    const safePoints: string[] = [];
    const warningPoints: string[] = [];

    if (sodium === null && salt === null) {
      warningPoints.push('Data kandungan natrium dan garam tidak tercantum pada database.');
      warningPoints.push('Penderita hipertensi disarankan mengecek langsung tabel gizi pada kemasan produk.');

      return {
        profile,
        badge: 'DATA TIDAK LENGKAP',
        badgeBg: '#94A3B8',
        isDataIncomplete: true,
        nutritionBasis,
        safePoints: ['Produk terdaftar di sistem, namun data rincian natrium belum lengkap.'],
        warningPoints,
        statusTable: [
          buildStatusRow('Garam/Natrium', null, 'Tidak tersedia', () => ({ status: 'AMAN', statusColor: 'green' })),
          satFatRow,
          buildStatusRow('Lemak Total', fat, formatVal(fat, 'g'), (v) => ({
            status: v > 10 ? 'WASPADA GULA' : 'AMAN',
            statusColor: v > 10 ? 'yellow' : 'green',
          })),
          proteinRow,
          buildStatusRow('Kalori', energy, formatVal(energy, 'kkal'), () => ({ status: 'AMAN', statusColor: 'green' })),
        ],
        nutritionTable: fullNutritionTable,
      };
    }

    let badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' = 'AMAN';
    let badgeBg = '#00D084';

    const effSodium = sodium ?? 0;
    const effSalt = salt ?? 0;

    const sodiumRow = buildStatusRow('Garam/Natrium', sodium !== null ? effSodium : effSalt, `${effSodium} mg`, () => {
      if (effSodium > 400 || effSalt > 1.0) {
        badge = 'TIDAK AMAN';
        badgeBg = '#FF4D4D';
        warningPoints.push(`Kandungan Natrium Tinggi (${effSodium} mg). Berisiko memicu retensi natrium dan kenaikan tekanan darah arteri.`);
        warningPoints.push(`Garam setara ${effSalt.toFixed(1)} g telah menyumbang persentase besar dari batas harian hipertensi.`);
        return { status: 'TIDAK AMAN', statusColor: 'red' };
      }
      if (effSodium > 150 || effSalt > 0.4) {
        badge = 'HATI-HATI';
        badgeBg = '#FFD027';
        warningPoints.push(`Kadar Natrium Sedang (${effSodium} mg). Batasi konsumsi tidak lebih dari 1 kemasan per hari.`);
        return { status: 'WASPADA GULA', statusColor: 'yellow' };
      }
      safePoints.push(`Kandungan Natrium Rendah (${effSodium} mg). Sangat ramah bagi stabilitas sirkulasi darah pembuluh arteri.`);
      safePoints.push(`Kadar Garam Terkendali (${effSalt.toFixed(2)} g), jauh di bawah batas toleransi harian.`);
      return { status: 'AMAN', statusColor: 'green' };
    });

    if (satFat !== null && satFat > 4) {
      warningPoints.push(`Perlu membatasi Lemak Jenuh (${satFat} g) untuk mencegah pengerasan dinding pembuluh darah.`);
    } else if (satFat !== null) {
      safePoints.push(`Lemak Jenuh Terkontrol (${satFat} g) mendukung elastisitas pembuluh darah.`);
    }

    if (proteins !== null && proteins >= 5) {
      safePoints.push(`Protein Memadai (${proteins} g) tanpa kandungan asam lemak trans.`);
    }

    if (warningPoints.length === 0) {
      warningPoints.push('Produk tergolong aman dari segi beban garam untuk penderita hipertensi.');
    }

    const totalFatRow = buildStatusRow('Lemak Total', fat, formatVal(fat, 'g'), (v) => ({
      status: v > 10 ? 'WASPADA GULA' : 'AMAN',
      statusColor: v > 10 ? 'yellow' : 'green',
    }));

    return {
      profile,
      badge,
      badgeBg,
      nutritionBasis,
      safePoints,
      warningPoints,
      statusTable: [
        sodiumRow,
        satFatRow,
        totalFatRow,
        proteinRow,
        buildStatusRow('Kalori', energy, formatVal(energy, 'kkal'), () => ({ status: 'AMAN', statusColor: 'green' })),
      ],
      nutritionTable: fullNutritionTable,
    };
  }
}
