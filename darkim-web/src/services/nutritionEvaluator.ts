import { HealthProfile, NutritionEvaluation, NutritionStatusItem, NutritionTableItem, ProductModel } from '@/types';

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

  const formatVal = (val: number | null, unit: string) => (val !== null ? `${val} ${unit}` : 'Tidak tersedia');

  if (profile === 'diabetes') {
    // ----------------------------------------------------
    // DIABETES MELITUS EVALUATION LOGIC
    // ----------------------------------------------------
    const safePoints: string[] = [];
    const warningPoints: string[] = [];
    let isDataIncomplete = false;

    // Check if key nutrients for diabetes exist
    if (sugars === null && carbs === null) {
      isDataIncomplete = true;
      warningPoints.push('Data kandungan gula dan karbohidrat tidak tercantum pada database.');
      warningPoints.push('Disarankan memeriksa tabel informasi nilai gizi pada kemasan fisik sebelum dikonsumsi.');

      return {
        profile,
        badge: 'DATA TIDAK LENGKAP',
        badgeBg: '#94A3B8', // neutral slate
        isDataIncomplete: true,
        safePoints: ['Produk terdaftar di sistem, namun data rincian gizi belum lengkap.'],
        warningPoints,
        statusTable: [
          { zat: 'Gula', status: 'BELUM ADA DATA', statusColor: 'yellow', jumlah: 'Tidak tersedia' },
          { zat: 'Karbohidrat', status: 'BELUM ADA DATA', statusColor: 'yellow', jumlah: 'Tidak tersedia' },
          { zat: 'Lemak Jenuh', status: satFat !== null && satFat > 3 ? 'WASPADA GULA' : (satFat !== null ? 'AMAN' : 'TIDAK ADA DATA'), statusColor: satFat !== null && satFat > 3 ? 'yellow' : 'green', jumlah: formatVal(satFat, 'g') },
          { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: formatVal(proteins, 'g') },
          { zat: 'Kalori Total', status: 'AMAN', statusColor: 'green', jumlah: formatVal(energy, 'kkal') },
        ],
        nutritionTable: [
          { zat: 'Kalori', jumlah: formatVal(energy, 'kkal') },
          { zat: 'Karbohidrat', jumlah: formatVal(carbs, 'g') },
          { zat: 'Gula', jumlah: formatVal(sugars, 'g') },
          { zat: 'Lemak Total', jumlah: formatVal(fat, 'g') },
          { zat: 'Lemak Jenuh', jumlah: formatVal(satFat, 'g') },
          { zat: 'Serat Pangan', jumlah: formatVal(fiber, 'g') },
          { zat: 'Protein', jumlah: formatVal(proteins, 'g') },
          { zat: 'Natrium', jumlah: formatVal(sodium, 'mg') },
        ],
      };
    }

    let badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' = 'AMAN';
    let badgeBg = '#00D084';

    // Evaluate Sugars
    let sugarStatus = 'AMAN';
    let sugarColor: 'green' | 'yellow' | 'red' = 'green';
    if (sugars !== null) {
      if (sugars > 15) {
        sugarStatus = 'TIDAK AMAN';
        sugarColor = 'red';
        badge = 'TIDAK AMAN';
        badgeBg = '#FF4D4D';
        warningPoints.push(`Kandungan Gula Sangat Tinggi (${sugars} g). Berisiko memicu lonjakan glukosa darah.`);
      } else if (sugars > 6) {
        sugarStatus = 'WASPADA GULA';
        sugarColor = 'yellow';
        badge = 'HATI-HATI';
        badgeBg = '#FFD027';
        warningPoints.push(`Kandungan Gula Sedang (${sugars} g). Perlu pembatasan porsi konsumsi harian.`);
      } else {
        safePoints.push(`Kadar Gula Rendah (${sugars} g). Ramah untuk pemeliharaan kadar gula darah.`);
      }
    } else {
      warningPoints.push('Kadar gula spesifik tidak tercantum terpisah.');
    }

    // Evaluate Carbs
    let carbStatus = 'AMAN';
    let carbColor: 'green' | 'yellow' | 'red' = 'green';
    if (carbs !== null) {
      if (carbs > 35) {
        carbStatus = 'TIDAK AMAN';
        carbColor = 'red';
        if (badge !== 'TIDAK AMAN') {
          badge = 'TIDAK AMAN';
          badgeBg = '#FF4D4D';
        }
        warningPoints.push(`Karbohidrat Tinggi (${carbs} g). Dapat meningkatkan beban glikemik secara bertahap.`);
      } else if (carbs > 20) {
        carbStatus = 'WASPADA GULA';
        carbColor = 'yellow';
        if (badge === 'AMAN') {
          badge = 'HATI-HATI';
          badgeBg = '#FFD027';
        }
      } else {
        safePoints.push(`Karbohidrat Terkontrol (${carbs} g).`);
      }
    }

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

    const statusTable: NutritionStatusItem[] = [
      { zat: 'Gula', status: sugarStatus, statusColor: sugarColor, jumlah: formatVal(sugars, 'g') },
      { zat: 'Karbohidrat', status: carbStatus, statusColor: carbColor, jumlah: formatVal(carbs, 'g') },
      { zat: 'Lemak Jenuh', status: satFat !== null && satFat > 3 ? 'WASPADA GULA' : 'AMAN', statusColor: satFat !== null && satFat > 3 ? 'yellow' : 'green', jumlah: formatVal(satFat, 'g') },
      { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: formatVal(proteins, 'g') },
      { zat: 'Kalori Total', status: energy !== null && energy > 250 ? 'WASPADA GULA' : 'AMAN', statusColor: energy !== null && energy > 250 ? 'yellow' : 'green', jumlah: formatVal(energy, 'kkal') },
    ];

    const nutritionTable: NutritionTableItem[] = [
      { zat: 'Kalori', jumlah: formatVal(energy, 'kkal') },
      { zat: 'Karbohidrat', jumlah: formatVal(carbs, 'g') },
      { zat: 'Gula', jumlah: formatVal(sugars, 'g') },
      { zat: 'Lemak Total', jumlah: formatVal(fat, 'g') },
      { zat: 'Lemak Jenuh', jumlah: formatVal(satFat, 'g') },
      { zat: 'Serat Pangan', jumlah: formatVal(fiber, 'g') },
      { zat: 'Protein', jumlah: formatVal(proteins, 'g') },
      { zat: 'Natrium', jumlah: formatVal(sodium, 'mg') },
    ];

    return {
      profile,
      badge,
      badgeBg,
      safePoints,
      warningPoints,
      statusTable,
      nutritionTable,
    };
  } else {
    // ----------------------------------------------------
    // HIPERTENSI EVALUATION LOGIC
    // ----------------------------------------------------
    const safePoints: string[] = [];
    const warningPoints: string[] = [];

    // Check if key nutrients for hypertension exist
    if (sodium === null && salt === null) {
      warningPoints.push('Data kandungan natrium dan garam tidak tercantum pada database.');
      warningPoints.push('Penderita hipertensi disarankan mengecek langsung tabel gizi pada kemasan produk.');

      return {
        profile,
        badge: 'DATA TIDAK LENGKAP',
        badgeBg: '#94A3B8',
        isDataIncomplete: true,
        safePoints: ['Produk terdaftar di sistem, namun data rincian natrium belum lengkap.'],
        warningPoints,
        statusTable: [
          { zat: 'Garam/Natrium', status: 'BELUM ADA DATA', statusColor: 'yellow', jumlah: 'Tidak tersedia' },
          { zat: 'Lemak Jenuh', status: satFat !== null && satFat > 3 ? 'WASPADA GULA' : 'AMAN', statusColor: satFat !== null && satFat > 3 ? 'yellow' : 'green', jumlah: formatVal(satFat, 'g') },
          { zat: 'Lemak Total', status: fat !== null && fat > 10 ? 'WASPADA GULA' : 'AMAN', statusColor: fat !== null && fat > 10 ? 'yellow' : 'green', jumlah: formatVal(fat, 'g') },
          { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: formatVal(proteins, 'g') },
          { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: formatVal(energy, 'kkal') },
        ],
        nutritionTable: [
          { zat: 'Natrium', jumlah: 'Tidak tersedia' },
          { zat: 'Garam', jumlah: 'Tidak tersedia' },
          { zat: 'Lemak Total', jumlah: formatVal(fat, 'g') },
          { zat: 'Lemak Jenuh', jumlah: formatVal(satFat, 'g') },
          { zat: 'Kalori', jumlah: formatVal(energy, 'kkal') },
        ],
      };
    }

    let badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' = 'AMAN';
    let badgeBg = '#00D084';

    let sodiumStatus = 'AMAN';
    let sodiumColor: 'green' | 'yellow' | 'red' = 'green';

    const effSodium = sodium ?? 0;
    const effSalt = salt ?? 0;

    // Sodium evaluation (WHO/Kemenkes guidance)
    if (effSodium > 400 || effSalt > 1.0) {
      sodiumStatus = 'TIDAK AMAN';
      sodiumColor = 'red';
      badge = 'TIDAK AMAN';
      badgeBg = '#FF4D4D';
      warningPoints.push(`Kandungan Natrium Tinggi (${effSodium} mg). Berisiko memicu retensi natrium dan kenaikan tekanan darah arteri.`);
      warningPoints.push(`Garam setara ${effSalt.toFixed(1)} g telah menyumbang persentase besar dari batas harian hipertensi.`);
    } else if (effSodium > 150 || effSalt > 0.4) {
      sodiumStatus = 'WASPADA GULA';
      sodiumColor = 'yellow';
      badge = 'HATI-HATI';
      badgeBg = '#FFD027';
      warningPoints.push(`Kadar Natrium Sedang (${effSodium} mg). Batasi konsumsi tidak lebih dari 1 kemasan per hari.`);
    } else {
      safePoints.push(`Kandungan Natrium Rendah (${effSodium} mg). Sangat ramah bagi stabilitas sirkulasi darah pembuluh arteri.`);
      safePoints.push(`Kadar Garam Terkendali (${effSalt.toFixed(2)} g), jauh di bawah batas toleransi harian.`);
    }

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

    const statusTable: NutritionStatusItem[] = [
      { zat: 'Garam/Natrium', status: sodiumStatus, statusColor: sodiumColor, jumlah: `${effSodium} mg` },
      { zat: 'Lemak Jenuh', status: satFat !== null && satFat > 3 ? 'WASPADA GULA' : 'AMAN', statusColor: satFat !== null && satFat > 3 ? 'yellow' : 'green', jumlah: formatVal(satFat, 'g') },
      { zat: 'Lemak Total', status: fat !== null && fat > 10 ? 'WASPADA GULA' : 'AMAN', statusColor: fat !== null && fat > 10 ? 'yellow' : 'green', jumlah: formatVal(fat, 'g') },
      { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: formatVal(proteins, 'g') },
      { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: formatVal(energy, 'kkal') },
    ];

    const nutritionTable: NutritionTableItem[] = [
      { zat: 'Natrium', jumlah: `${effSodium} mg` },
      { zat: 'Garam', jumlah: `${effSalt.toFixed(2)} g` },
      { zat: 'Lemak Total', jumlah: formatVal(fat, 'g') },
      { zat: 'Lemak Jenuh', jumlah: formatVal(satFat, 'g') },
      { zat: 'Kalori', jumlah: formatVal(energy, 'kkal') },
    ];

    return {
      profile,
      badge,
      badgeBg,
      safePoints,
      warningPoints,
      statusTable,
      nutritionTable,
    };
  }
}

