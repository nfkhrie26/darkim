import { HealthProfile, NutritionEvaluation, NutritionStatusItem, NutritionTableItem, ProductModel } from '@/types';

/**
 * Isolated Nutrition Evaluation Service (Dummy Rules)
 * Evaluates food/drink products based on health profiles (Hipertensi vs Diabetes Melitus).
 */
export function evaluateNutrition(product: Partial<ProductModel>, profile: HealthProfile): NutritionEvaluation {
  const energy = product.energy ?? 150;
  const carbs = product.carbohydrates ?? 20;
  const sugars = product.sugars ?? 10;
  const fiber = product.fiber ?? 1;
  const proteins = product.proteins ?? 4;
  const fat = product.fat ?? 3;
  const satFat = product.saturatedFat ?? 1.5;
  const sodium = product.sodium ?? 100; // in mg
  const salt = product.salt ?? (sodium * 2.5 / 1000); // approx gram

  if (profile === 'diabetes') {
    // ----------------------------------------------------
    // DIABETES MELITUS DUMMY EVALUATION LOGIC
    // ----------------------------------------------------
    let badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' = 'AMAN';
    let badgeBg = '#00D084';
    const safePoints: string[] = [];
    const warningPoints: string[] = [];

    // Evaluate Sugars
    let sugarStatus = 'AMAN';
    let sugarColor: 'green' | 'yellow' | 'red' = 'green';
    if (sugars > 15) {
      sugarStatus = 'TIDAK AMAN';
      sugarColor = 'red';
      badge = 'TIDAK AMAN';
      badgeBg = '#FF4D4D';
      warningPoints.push(`Kandungan Gula Sangat Tinggi (${sugars} g). Sangat berisiko memicu lonjakan glukosa darah.`);
    } else if (sugars > 6) {
      sugarStatus = 'WASPADA GULA';
      sugarColor = 'yellow';
      badge = 'HATI-HATI';
      badgeBg = '#FFD027';
      warningPoints.push(`Kandungan Gula Sedang (${sugars} g). Perlu pembatasi porsi konsumsi harian.`);
    } else {
      safePoints.push(`Kadar Gula Rendah (${sugars} g). Ramah untuk pemeliharaan kadar gula darah.`);
    }

    // Evaluate Carbs
    let carbStatus = 'AMAN';
    let carbColor: 'green' | 'yellow' | 'red' = 'green';
    if (carbs > 35) {
      carbStatus = 'TIDAK AMAN';
      carbColor = 'red';
      warningPoints.push(`Karbohidrat Tinggi (${carbs} g). Dapat meningkatkan beban glikemik secara bertahap.`);
    } else if (carbs > 20) {
      carbStatus = 'WASPADA GULA';
      carbColor = 'yellow';
    } else {
      safePoints.push(`Karbohidrat Terkontrol (${carbs} g).`);
    }

    if (fiber >= 2) {
      safePoints.push(`Mengandung Serat Pangan (${fiber} g) yang membantu memperlambat penyerapan glukosa.`);
    }
    if (proteins >= 5) {
      safePoints.push(`Kandungan Protein Alami (${proteins} g) menunjang perbaikan sel dan rasa kenyang stabil.`);
    }
    if (sodium <= 120) {
      safePoints.push(`Natrium Rendah (${sodium} mg), aman untuk organ ginjal penderita diabetes.`);
    }

    if (warningPoints.length === 0) {
      warningPoints.push('Tetap perhatikan takaran saji dan konsultasikan pola makan dengan dokter/ahli gizi.');
    }

    const statusTable: NutritionStatusItem[] = [
      { zat: 'Gula', status: sugarStatus, statusColor: sugarColor, jumlah: `${sugars} g` },
      { zat: 'Karbohidrat', status: carbStatus, statusColor: carbColor, jumlah: `${carbs} g` },
      { zat: 'Lemak Jenuh', status: satFat > 3 ? 'WASPADA GULA' : 'AMAN', statusColor: satFat > 3 ? 'yellow' : 'green', jumlah: `${satFat} g` },
      { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: `${proteins} g` },
      { zat: 'Kalori Total', status: energy > 250 ? 'WASPADA GULA' : 'AMAN', statusColor: energy > 250 ? 'yellow' : 'green', jumlah: `${energy} kkal` },
    ];

    const nutritionTable: NutritionTableItem[] = [
      { zat: 'Kalori', jumlah: `${energy} kkal` },
      { zat: 'Karbohidrat', jumlah: `${carbs} g` },
      { zat: 'Gula', jumlah: `${sugars} g` },
      { zat: 'Serat Pangan', jumlah: `${fiber} g` },
      { zat: 'Protein', jumlah: `${proteins} g` },
      { zat: 'Natrium', jumlah: `${sodium} mg` },
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
    // HIPERTENSI DUMMY EVALUATION LOGIC
    // ----------------------------------------------------
    let badge: 'AMAN' | 'HATI-HATI' | 'TIDAK AMAN' = 'AMAN';
    let badgeBg = '#00D084';
    const safePoints: string[] = [];
    const warningPoints: string[] = [];

    let sodiumStatus = 'AMAN';
    let sodiumColor: 'green' | 'yellow' | 'red' = 'green';

    // Sodium evaluation (WHO/Kemenkes guidance)
    if (sodium > 400 || salt > 1.0) {
      sodiumStatus = 'TIDAK AMAN';
      sodiumColor = 'red';
      badge = 'TIDAK AMAN';
      badgeBg = '#FF4D4D';
      warningPoints.push(`Kandungan Natrium Tinggi (${sodium} mg). Berisiko memicu retensi natrium dan kenaikan tekanan darah arteri.`);
      warningPoints.push(`Garam setara ${salt.toFixed(1)} g telah menyumbang persentase besar dari batas harian hipertensi.`);
    } else if (sodium > 150 || salt > 0.4) {
      sodiumStatus = 'WASPADA GULA';
      sodiumColor = 'yellow';
      badge = 'HATI-HATI';
      badgeBg = '#FFD027';
      warningPoints.push(`Kadar Natrium Sedang (${sodium} mg). Batasi konsumsi tidak lebih dari 1 kemasan per hari.`);
    } else {
      safePoints.push(`Kandungan Natrium Rendah (${sodium} mg). Sangat ramah bagi stabilitas sirkulasi darah pembuluh arteri.`);
      safePoints.push(`Kadar Garam Terkendali (${salt.toFixed(2)} g), jauh di bawah batas toleransi harian.`);
    }

    if (satFat > 4) {
      warningPoints.push(`Perlu membatasi Lemak Jenuh (${satFat} g) untuk mencegah pengerasan dinding pembuluh darah.`);
    } else {
      safePoints.push(`Lemak Jenuh Terkontrol (${satFat} g) mendukung elastisitas pembuluh darah.`);
    }

    if (proteins >= 5) {
      safePoints.push(`Protein Memadai (${proteins} g) tanpa kandungan asam lemak trans.`);
    }

    if (warningPoints.length === 0) {
      warningPoints.push('Produk tergolong aman dari segi beban garam untuk penderita hipertensi.');
    }

    const statusTable: NutritionStatusItem[] = [
      { zat: 'Garam/Natrium', status: sodiumStatus, statusColor: sodiumColor, jumlah: `${sodium} mg` },
      { zat: 'Lemak Jenuh', status: satFat > 3 ? 'WASPADA GULA' : 'AMAN', statusColor: satFat > 3 ? 'yellow' : 'green', jumlah: `${satFat} g` },
      { zat: 'Lemak Total', status: fat > 10 ? 'WASPADA GULA' : 'AMAN', statusColor: fat > 10 ? 'yellow' : 'green', jumlah: `${fat} g` },
      { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: `${proteins} g` },
      { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: `${energy} kkal` },
    ];

    const nutritionTable: NutritionTableItem[] = [
      { zat: 'Natrium', jumlah: `${sodium} mg` },
      { zat: 'Garam', jumlah: `${salt.toFixed(2)} g` },
      { zat: 'Lemak Total', jumlah: `${fat} g` },
      { zat: 'Lemak Jenuh', jumlah: `${satFat} g` },
      { zat: 'Kalori', jumlah: `${energy} kkal` },
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

