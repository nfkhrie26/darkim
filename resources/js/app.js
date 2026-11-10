// DARKIM Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Shared Products Data Store
    // ----------------------------------------------------
    const products = [
        {
            id: 'ultra-milk',
            name: 'Ultra Milk Susu UHT Rasa Cokelat Segar - 250ml',
            shortName: 'Ultra Milk 250ml',
            brand: 'Ultrajaya',
            category: 'Minuman',
            categoryMeta: 'Minuman Susu UHT',
            thumb: {
                initials: 'UM',
                title: 'ULTRA MILK',
                sub: 'COKELAT UHT',
                bg: '#183c5e'
            },
            diabetes: {
                badge: 'TIDAK AMAN',
                badgeBg: '#FF4D4D',
                safePoints: [
                    'Tinggi Kalsium (300 mg) & Fosfor mendukung metabolisme dan densitas tulang',
                    'Kandungan Protein Alami (6.0 g) bermanfaat bagi regenerasi sel tubuh',
                    'Kandungan Garam Rendah (70.0 mg) aman bagi fungsi organ ginjal'
                ],
                warningPoints: [
                    'Perhatian Diabetes: Gula Total 18.0 g (Tinggi)! Berisiko memicu lonjakan glukosa darah penderita Diabetes',
                    'Indeks Glikemik sedang-tinggi pada varian berperisa manis sebaiknya dihindari saat gula darah belum stabil'
                ],
                statusTable: [
                    { zat: 'Gula', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '18 g' },
                    { zat: 'Karbohidrat', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '22 g' },
                    { zat: 'Lemak Jenuh', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '3.0 g' },
                    { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: '6.0 g' },
                    { zat: 'Kalsium', status: 'AMAN', statusColor: 'green', jumlah: '300 mg' },
                ]
            },
            hipertensi: {
                badge: 'AMAN',
                badgeBg: '#00D084',
                safePoints: [
                    'Kandungan Natrium Rendah (70.0 mg / 3.5% AKG), sangat aman bagi penderita Hipertensi',
                    'Kaya Kalium & Kalsium alami yang terbukti mendukung relaksasi dinding arteri dan regulasi denyut jantung',
                    'Bebas dari bahan pengawet sintesis yang dapat membebani kerja ginjal'
                ],
                warningPoints: [
                    'Batasi konsumsi maksimal 1 kotak per hari jika penderita memiliki riwayat komplikasi obesitas'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '70 mg' },
                    { zat: 'Kalsium', status: 'AMAN', statusColor: 'green', jumlah: '300 mg' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '4.5 g' },
                    { zat: 'Kolesterol', status: 'AMAN', statusColor: 'green', jumlah: '10 mg' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '160 kkal' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '160 kkal' },
                { zat: 'Karbohidrat', jumlah: '22 g' },
                { zat: 'Gula', jumlah: '18 g' },
                { zat: 'Natrium', jumlah: '70 mg' },
                { zat: 'Protein', jumlah: '6 g' },
            ]
        },
        {
            id: 'koko-krunch',
            name: 'Nestlé Koko Krunch Sereal Cokelat Gandum - 170g',
            shortName: 'Koko Krunch Sereal 170g',
            brand: 'Nestlé',
            category: 'Makanan',
            categoryMeta: 'Makanan Ringan / Sereal',
            thumb: {
                initials: 'KK',
                title: 'KOKO KRUNCH',
                sub: 'COKELAT',
                bg: '#3e2111'
            },
            diabetes: {
                badge: 'HATI-HATI',
                badgeBg: '#FFD027',
                safePoints: [
                    'Kandungan Natrium Rendah (45.0 mg) Aman untuk konsumsi harian keluarga',
                    'Sumber Serat Pangan 2.0 g membantu memperlambat penyerapan glukosa dalam usus halus',
                    'Kandungan Lemak Total Rendah (1.5 g) Hanya 2.3% dari AKG harian'
                ],
                warningPoints: [
                    'Perhatian Diabetes: Mengandung Gula 9.0 g per sajian (18% batas harian). Batasi konsumsi tidak melebihi 1 mangkuk takar'
                ],
                statusTable: [
                    { zat: 'Gula', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '9.0 g' },
                    { zat: 'Serat Pangan', status: 'AMAN', statusColor: 'green', jumlah: '2.0 g' },
                    { zat: 'Karbohidrat', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '24 g' },
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '45 mg' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '1.5 g' },
                ]
            },
            hipertensi: {
                badge: 'AMAN',
                badgeBg: '#00D084',
                safePoints: [
                    'Kandungan Natrium Sangat Rendah (45.0 mg / 2.2% batas harian Hipertensi)',
                    'Kandungan Lemak Jenuh Sangat Rendah (0.6 g), ramah bagi kesehatan kardiovaskular',
                    'Diperkaya Vitamin B Kompleks & Zat Besi untuk menunjang sirkulasi oksigen pembuluh darah'
                ],
                warningPoints: [
                    'Padukan dengan susu segar rendah lemak (low-fat) guna menjaga tekanan darah tetap optimal'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '45 mg' },
                    { zat: 'Lemak Jenuh', status: 'AMAN', statusColor: 'green', jumlah: '0.6 g' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '1.5 g' },
                    { zat: 'Kolesterol', status: 'AMAN', statusColor: 'green', jumlah: '0 mg' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '110 kkal' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '110 kkal' },
                { zat: 'Karbohidrat', jumlah: '24 g' },
                { zat: 'Gula', jumlah: '9 g' },
                { zat: 'Natrium', jumlah: '45 mg' },
                { zat: 'Serat Pangan', jumlah: '2 g' },
            ]
        },
        {
            id: 'teh-botol',
            name: 'Teh Botol Sosro Original - 250ml',
            shortName: 'Teh Botol Sosro 250ml',
            brand: 'Sosro',
            category: 'Minuman',
            categoryMeta: 'Minuman Teh Melati',
            thumb: {
                initials: 'TB',
                title: 'TEH BOTOL',
                sub: 'ORIGINAL SOSRO',
                bg: '#4a1515'
            },
            diabetes: {
                badge: 'TIDAK AMAN',
                badgeBg: '#FF4D4D',
                safePoints: [
                    'Kandungan Garam / Natrium Sangat Rendah (15.0 mg)',
                    'Bebas Lemak Total (0 g) dan Bebas Kolesterol (0 mg)',
                    'Mengandung ekstrak antioksidan alami polifenol dari daun teh'
                ],
                warningPoints: [
                    'Perhatian Diabetes: Kandungan Gula 15.0 g per 250ml berupa sukrosa murni tanpa serat, memicu kenaikan gula darah seketika',
                    'Disarankan beralih ke varian Teh Botol Tawar (Zero Sugar) bagi penderita Diabetes'
                ],
                statusTable: [
                    { zat: 'Gula', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '15 g' },
                    { zat: 'Karbohidrat', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '16 g' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '0 g' },
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '15 mg' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '60 kkal' },
                ]
            },
            hipertensi: {
                badge: 'AMAN',
                badgeBg: '#00D084',
                safePoints: [
                    'Kandungan Natrium Sangat Rendah (15 mg), tidak mengganggu keseimbangan elektrolit pembuluh darah',
                    'Antioksidan flavonoid teh membantu memelihara kelenturan pembuluh darah',
                    'Bebas lemak jenuh dan asam lemak trans'
                ],
                warningPoints: [
                    'Kandungan kafein ringan (sekitar 15-20 mg). Jika sensitif terhadap kafein, konsumsi sewajarnya'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '15 mg' },
                    { zat: 'Lemak Jenuh', status: 'AMAN', statusColor: 'green', jumlah: '0 g' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '0 g' },
                    { zat: 'Kolesterol', status: 'AMAN', statusColor: 'green', jumlah: '0 mg' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '60 kkal' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '60 kkal' },
                { zat: 'Karbohidrat', jumlah: '16 g' },
                { zat: 'Gula', jumlah: '15 g' },
                { zat: 'Natrium', jumlah: '15 mg' },
                { zat: 'Lemak', jumlah: '0 g' },
            ]
        },
        {
            id: 'indomie-goreng',
            name: 'Indomie Mi Goreng Spesial Instan - 85g',
            shortName: 'Indomie Mi Goreng 85g',
            brand: 'Indofood',
            category: 'Makanan',
            categoryMeta: 'Makanan Instan',
            thumb: {
                initials: 'IG',
                title: 'INDOMIE',
                sub: 'MI GORENG',
                bg: '#7a1f0d'
            },
            diabetes: {
                badge: 'HATI-HATI',
                badgeBg: '#FFD027',
                safePoints: [
                    'Kandungan Gula Tambahan Relatif Rendah (4.0 g)',
                    'Diperkaya Zat Besi, Niasin, dan Vitamin A/B1/B6/B12'
                ],
                warningPoints: [
                    'Perhatian Diabetes: Karbohidrat Olahan 54.0 g (Tinggi) dengan indeks glikemik tinggi dari tepung terigu refined',
                    'Rendah serat pangan (hanya 1.0 g) menyebabkan konversi karbohidrat menjadi gula darah sangat cepat'
                ],
                statusTable: [
                    { zat: 'Karbohidrat', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '54 g' },
                    { zat: 'Gula', status: 'AMAN', statusColor: 'green', jumlah: '4.0 g' },
                    { zat: 'Lemak Jenuh', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '8.0 g' },
                    { zat: 'Garam/Natrium', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '1070 mg' },
                    { zat: 'Kalori', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '380 kkal' },
                ]
            },
            hipertensi: {
                badge: 'TIDAK AMAN',
                badgeBg: '#FF4D4D',
                safePoints: [
                    'Mengandung protein 8.0 g dari gandum pilihan'
                ],
                warningPoints: [
                    'BAHAYA HIPERTENSI: Natrium 1070 mg per sajian (53% dari batas total garam harian penderita hipertensi!)',
                    'Kandungan Lemak Jenuh 8.0 g dari minyak kelapa sawit bumbu berisiko menyumbat pembuluh darah',
                    'Sangat disarankan mengurangi penggunaan bumbu asin hingga 50% atau lebih'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '1070 mg' },
                    { zat: 'Lemak Jenuh', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '8.0 g' },
                    { zat: 'Lemak Total', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '17 g' },
                    { zat: 'Kalori', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '380 kkal' },
                    { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: '8.0 g' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '380 kkal' },
                { zat: 'Karbohidrat', jumlah: '54 g' },
                { zat: 'Lemak Total', jumlah: '17 g' },
                { zat: 'Gula', jumlah: '4 g' },
                { zat: 'Natrium', jumlah: '1070 mg' },
            ]
        },
        {
            id: 'bear-brand',
            name: 'Susu Steril Bear Brand Murni - 189ml',
            shortName: 'Susu Bear Brand 189ml',
            brand: 'Nestlé',
            category: 'Minuman',
            categoryMeta: 'Minuman Susu Murni',
            thumb: {
                initials: 'BB',
                title: 'BEAR BRAND',
                sub: 'SUSU STERIL',
                bg: '#1e3a5f'
            },
            diabetes: {
                badge: 'AMAN',
                badgeBg: '#00D084',
                safePoints: [
                    'Bebas Gula Tambahan (0 g Sugar Added). Hanya laktosa alami susu murni',
                    'Indeks Glikemik Sangat Rendah, tidak memicu lonjakan insulin secara mendadak',
                    'Kaya Kalsium (20% AKG) dan Protein (6 g) berkualitas tinggi'
                ],
                warningPoints: [
                    'Perhatikan kalori total (120 kkal) jika sedang menjalani program defisit kalori diabetes ketat'
                ],
                statusTable: [
                    { zat: 'Gula Tambahan', status: 'AMAN', statusColor: 'green', jumlah: '0 g' },
                    { zat: 'Karbohidrat', status: 'AMAN', statusColor: 'green', jumlah: '9.0 g' },
                    { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: '6.0 g' },
                    { zat: 'Kalsium', status: 'AMAN', statusColor: 'green', jumlah: '240 mg' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '120 kkal' },
                ]
            },
            hipertensi: {
                badge: 'AMAN',
                badgeBg: '#00D084',
                safePoints: [
                    'Kadar Natrium Terkendali (85 mg / 4% batas harian), aman bagi penderita darah tinggi',
                    'Kaya Kalsium dan Kalium alami untuk stabilitas kontraksi miokardium pembuluh darah',
                    'Proses sterilisasi murni tanpa penambahan bahan pengawet atau penguat rasa'
                ],
                warningPoints: [
                    'Kandungan Lemak Jenuh 4.5 g, cukup konsumsi 1 kaleng per hari untuk menjaga profil lipid seimbang'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '85 mg' },
                    { zat: 'Kalsium', status: 'AMAN', statusColor: 'green', jumlah: '240 mg' },
                    { zat: 'Lemak Jenuh', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '4.5 g' },
                    { zat: 'Protein', status: 'AMAN', statusColor: 'green', jumlah: '6.0 g' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '120 kkal' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '120 kkal' },
                { zat: 'Karbohidrat', jumlah: '9 g' },
                { zat: 'Gula', jumlah: '0 g (Added)' },
                { zat: 'Natrium', jumlah: '85 mg' },
                { zat: 'Protein', jumlah: '6 g' },
            ]
        },
        {
            id: 'oreo-vanilla',
            name: 'Oreo Biskuit Sandwich Krim Vanilla - 133g',
            shortName: 'Oreo Biskuit Vanilla 133g',
            brand: 'Mondelez',
            category: 'Makanan',
            categoryMeta: 'Makanan Biskuit & Snack',
            thumb: {
                initials: 'OR',
                title: 'OREO',
                sub: 'VANILLA',
                bg: '#14202d'
            },
            diabetes: {
                badge: 'TIDAK AMAN',
                badgeBg: '#FF4D4D',
                safePoints: [
                    'Mengandung Kakao Bubuk Asli dengan antioksidan flavonoid',
                    'Kandungan Kolesterol 0 mg'
                ],
                warningPoints: [
                    'PERINGATAN DIABETES: Gula 14.0 g per 3 keping biskuit (28% batas gula harian)',
                    'Tinggi Karbohidrat Sederhana (21.0 g per sajian) yang cepat dicerna menjadi glukosa darah',
                    'Sangat disarankan menghindari konsumsi bagi penderita diabetes yang tidak terkontrol'
                ],
                statusTable: [
                    { zat: 'Gula', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '14 g' },
                    { zat: 'Karbohidrat', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '21 g' },
                    { zat: 'Lemak Jenuh', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '3.5 g' },
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '140 mg' },
                    { zat: 'Kalori', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '140 kkal' },
                ]
            },
            hipertensi: {
                badge: 'HATI-HATI',
                badgeBg: '#FFD027',
                safePoints: [
                    'Bebas kolesterol (0 mg)',
                    'Kandungan kalium ringan dari bubuk kakao'
                ],
                warningPoints: [
                    'Perlu Membatasi Natrium (140 mg per sajian 3 keping)',
                    'Lemak Jenuh 3.5 g (18% batas harian) berisiko memicu plak pembuluh darah jika berlebih'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '140 mg' },
                    { zat: 'Lemak Jenuh', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '3.5 g' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '6.0 g' },
                    { zat: 'Kolesterol', status: 'AMAN', statusColor: 'green', jumlah: '0 mg' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '140 kkal' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '140 kkal' },
                { zat: 'Karbohidrat', jumlah: '21 g' },
                { zat: 'Gula', jumlah: '14 g' },
                { zat: 'Natrium', jumlah: '140 mg' },
                { zat: 'Lemak', jumlah: '6 g' },
            ]
        },
        {
            id: 'bani-hanyut',
            name: 'Rokok Bani Hanyut Rasa Blueberry - 250 batang',
            shortName: 'Bani Hanyut Blueberry',
            brand: 'Bani Hanyut',
            category: 'Produk Khusus',
            categoryMeta: 'Produk Khusus',
            thumb: {
                initials: 'BH',
                title: 'BANI HANYUT',
                sub: 'BLUEBERRY',
                bg: '#1b2b34'
            },
            diabetes: {
                badge: 'HATI-HATI',
                badgeBg: '#FFD027',
                safePoints: [
                    'Kandungan Natrium Rendah/Wajar (25.0 mg) Hanya menyumbang 1.2% dari batas harian',
                    'Kandungan Garam Rendah/Wajar (0.03 g), Hanya menyumbang 0.6% dari batas harian',
                    'Kandungan Lemak Total Rendah/Wajar (4.0 g), Hanya menyumbang 7.2% dari batas harian'
                ],
                warningPoints: [
                    'Perlu Membatasi Lemak Jenuh (2.0 g), Mengandung 12.8% dari batas maksimal harian',
                    'Perhatian Diabetes: Perisa manis dengan kandungan gula 24.0 g berisiko memicu lonjakan glukosa darah penderita Diabetes'
                ],
                statusTable: [
                    { zat: 'Gula', status: 'TIDAK AMAN', statusColor: 'red', jumlah: '24 g' },
                    { zat: 'Garam/Natrium', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '200 mg' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '4.0 g' },
                    { zat: 'Lemak Jenuh', status: 'AMAN', statusColor: 'green', jumlah: '2.0 g' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '180 kkal' },
                ]
            },
            hipertensi: {
                badge: 'HATI-HATI',
                badgeBg: '#FFD027',
                safePoints: [
                    'Kandungan Natrium Sangat Rendah (25.0 mg), tidak memicu retensi cairan di pembuluh darah',
                    'Kandungan Garam Minimal (0.03 g), jauh di bawah batas maksimal 5.0 g/hari rekomendasi Hipertensi Kemenkes',
                    'Kandungan Lemak Total Terkontrol (4.0 g) membantu menjaga kelancaran sirkulasi darah'
                ],
                warningPoints: [
                    'Perhatian Hipertensi: Kandungan nikotin dan asap tembakau memicu vasokonstriksi (penyempitan pembuluh darah) dan lonjakan tekanan darah mendadak',
                    'Perlu Membatasi Lemak Jenuh (2.0 g) guna mencegah kekakuan dinding pembuluh darah arteri'
                ],
                statusTable: [
                    { zat: 'Garam/Natrium', status: 'AMAN', statusColor: 'green', jumlah: '25 mg' },
                    { zat: 'Lemak Jenuh', status: 'WASPADA GULA', statusColor: 'yellow', jumlah: '2.0 g' },
                    { zat: 'Lemak Total', status: 'AMAN', statusColor: 'green', jumlah: '4.0 g' },
                    { zat: 'Nikotin/Tembakau', status: 'TIDAK AMAN', statusColor: 'red', jumlah: 'Tinggi' },
                    { zat: 'Kalori', status: 'AMAN', statusColor: 'green', jumlah: '180 kkal' },
                ]
            },
            nutritionTable: [
                { zat: 'Kalori', jumlah: '180 kkal' },
                { zat: 'Karbohidrat', jumlah: '30 g' },
                { zat: 'Gula', jumlah: '12 g' },
                { zat: 'Natrium', jumlah: '200 mg' },
                { zat: 'Garam', jumlah: '0,5 g' },
            ]
        }
    ];

    // ----------------------------------------------------
    // 2. Global Toast Helper
    // ----------------------------------------------------
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(message, duration = 3000) {
        if (!toastNotification || !toastMessage) return;
        toastMessage.textContent = message;
        toastNotification.classList.remove('hidden');
        toastNotification.classList.add('flex');
        setTimeout(() => {
            toastNotification.classList.add('hidden');
            toastNotification.classList.remove('flex');
        }, duration);
    }

    // Helper to render health advice in container
    function renderProductHealthAdvice(product, activeFilter, containerElements) {
        const advice = product[activeFilter] || product.diabetes;

        // Badge
        if (containerElements.productBadge) {
            containerElements.productBadge.textContent = advice.badge;
            containerElements.productBadge.style.backgroundColor = advice.badgeBg;
            if (advice.badgeBg === '#FF4D4D') {
                containerElements.productBadge.classList.remove('text-black');
                containerElements.productBadge.classList.add('text-white');
            } else {
                containerElements.productBadge.classList.remove('text-white');
                containerElements.productBadge.classList.add('text-black');
            }
        }

        // Safe Points (Checkmarks)
        if (containerElements.safePointsList) {
            containerElements.safePointsList.innerHTML = advice.safePoints.map(point => `
                <div class="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                    <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">✓</span>
                    <span>${point}</span>
                </div>
            `).join('');
        }

        // Warning Points (Warning icon)
        if (containerElements.warningPointsList) {
            containerElements.warningPointsList.innerHTML = advice.warningPoints.map(point => `
                <div class="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
                    <span class="text-amber-500 text-base shrink-0 leading-none">⚠️</span>
                    <span>${point}</span>
                </div>
            `).join('');
        }

        // Status Table
        if (containerElements.statusTableBody && advice.statusTable) {
            containerElements.statusTableBody.innerHTML = advice.statusTable.map(item => {
                let badgeClass = 'bg-[#00D084] text-black';
                if (item.statusColor === 'red') {
                    badgeClass = 'bg-[#FF4D4D] text-white';
                } else if (item.statusColor === 'yellow') {
                    badgeClass = 'bg-[#FFD027] text-black';
                }

                return `
                    <tr class="border-b-2 border-black last:border-b-0">
                        <td class="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">${item.zat}</td>
                        <td class="py-2.5 px-3 text-center">
                            <span class="inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm ${badgeClass}">
                                ${item.status}
                            </span>
                        </td>
                        <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">${item.jumlah}</td>
                    </tr>
                `;
            }).join('');
        }

        // Nutrition Info Table (Pure info)
        if (containerElements.nutritionTableBody && product.nutritionTable) {
            containerElements.nutritionTableBody.innerHTML = product.nutritionTable.map(item => `
                <tr class="border-b-2 border-black/10 last:border-b-0">
                    <td class="py-2 px-3 text-xs font-semibold text-gray-800">${item.zat}</td>
                    <td class="py-2 px-3 text-right text-xs font-bold text-black">${item.jumlah}</td>
                </tr>
            `).join('');
        }
    }

    // ----------------------------------------------------
    // 3. Module A: Katalog Produk Page (/katalog)
    // ----------------------------------------------------
    const catalogGrid = document.getElementById('catalogGrid');
    if (catalogGrid) {
        const searchInput = document.getElementById('catalogSearchInput');
        const searchSubmitBtn = document.getElementById('catalogSearchSubmitBtn');
        const categoryFilter = document.getElementById('catalogCategoryFilter');
        const emptyState = document.getElementById('catalogEmptyState');
        const productItems = catalogGrid.querySelectorAll('.product-item');

        function filterCatalog() {
            const query = (searchInput?.value || '').toLowerCase().trim();
            const selectedCategory = (categoryFilter?.value || 'all').toLowerCase();

            let visibleCount = 0;

            productItems.forEach(item => {
                const itemCategory = (item.getAttribute('data-category') || '').toLowerCase();
                const itemName = (item.getAttribute('data-name') || '').toLowerCase();

                const matchesCategory = (selectedCategory === 'all' || itemCategory === selectedCategory);
                const matchesSearch = (!query || itemName.includes(query) || itemCategory.includes(query));

                if (matchesCategory && matchesSearch) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (emptyState) {
                if (visibleCount === 0) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', filterCatalog);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                filterCatalog();
                const label = categoryFilter.options[categoryFilter.selectedIndex].text;
                showToast(`Kategori aktif: ${label}`);
            });
        }

        if (searchSubmitBtn) {
            searchSubmitBtn.addEventListener('click', () => {
                filterCatalog();
                showToast('Pencarian katalog diperbarui.');
            });
        }

        // Pagination interactions (mock demo feedback)
        document.querySelectorAll('nav[aria-label="Navigasi Halaman Katalog"] button').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.trim();
                showToast(`Halaman ${text} diklik (Simulasi katalog)`);
            });
        });
    }

    // ----------------------------------------------------
    // 4. Module B: Detail Produk Page (/produk/{id})
    // ----------------------------------------------------
    const detailContainer = document.querySelector('main[data-product-id]');
    if (detailContainer) {
        const targetId = detailContainer.getAttribute('data-product-id');
        const product = products.find(p => p.id === targetId) || products[0];

        let activeFilter = 'diabetes';
        let nutritionViewMode = 'status';

        const detailElements = {
            productTitle: document.getElementById('productTitle'),
            detailBrandMeta: document.getElementById('detailBrandMeta'),
            detailThumbInitials: document.getElementById('detailThumbInitials'),
            detailThumbTitle: document.getElementById('detailThumbTitle'),
            detailThumbSub: document.getElementById('detailThumbSub'),
            detailCategoryPill: document.getElementById('detailCategoryPill'),
            productBadge: document.getElementById('productBadge'),
            safePointsList: document.getElementById('safePointsList'),
            warningPointsList: document.getElementById('warningPointsList'),
            statusTableBody: document.getElementById('statusTableBody'),
            nutritionTableBody: document.getElementById('nutritionTableBody'),
            statusTableView: document.getElementById('statusTableView'),
            nutritionTableView: document.getElementById('nutritionTableView'),
            tagDiabetes: document.getElementById('tagDiabetes'),
            tagHipertensi: document.getElementById('tagHipertensi'),
            tableModeToggleBtn: document.getElementById('tableModeToggleBtn'),
            openReportBtn: document.getElementById('openReportBtn'),
            closeReportBtn: document.getElementById('closeReportBtn'),
            reportModal: document.getElementById('reportModal'),
            reportForm: document.getElementById('reportForm'),
            reportTextarea: document.getElementById('reportTextarea'),
        };

        // Hydrate Product Header & Metadata
        if (detailElements.productTitle) {
            detailElements.productTitle.textContent = product.name;
        }
        if (detailElements.detailBrandMeta) {
            detailElements.detailBrandMeta.textContent = `${product.brand} • ${product.categoryMeta || product.category}`;
        }
        if (detailElements.detailThumbInitials && product.thumb) {
            detailElements.detailThumbInitials.textContent = product.thumb.initials;
        }
        if (detailElements.detailThumbTitle && product.thumb) {
            detailElements.detailThumbTitle.textContent = product.thumb.title;
        }
        if (detailElements.detailThumbSub && product.thumb) {
            detailElements.detailThumbSub.textContent = product.thumb.sub;
        }
        if (detailElements.detailCategoryPill) {
            detailElements.detailCategoryPill.textContent = product.category;
        }

        // Render Initial Health Advice
        renderProductHealthAdvice(product, activeFilter, detailElements);

        // Mutual Exclusion Filter for Tags
        function setDetailFilter(newFilter) {
            if (activeFilter === newFilter) {
                showToast(`Filter ${newFilter.toUpperCase()} sedang aktif.`);
                return;
            }

            activeFilter = newFilter;

            if (newFilter === 'diabetes') {
                detailElements.tagDiabetes?.classList.remove('bg-white');
                detailElements.tagDiabetes?.classList.add('bg-[#00D084]');
                detailElements.tagDiabetes?.setAttribute('aria-checked', 'true');
                detailElements.tagHipertensi?.classList.remove('bg-[#00D084]');
                detailElements.tagHipertensi?.classList.add('bg-white');
                detailElements.tagHipertensi?.setAttribute('aria-checked', 'false');
                showToast('Filter DIABETES aktif: Analisis Gula & Karbohidrat');
            } else {
                detailElements.tagHipertensi?.classList.remove('bg-white');
                detailElements.tagHipertensi?.classList.add('bg-[#00D084]');
                detailElements.tagHipertensi?.setAttribute('aria-checked', 'true');
                detailElements.tagDiabetes?.classList.remove('bg-[#00D084]');
                detailElements.tagDiabetes?.classList.add('bg-white');
                detailElements.tagDiabetes?.setAttribute('aria-checked', 'false');
                showToast('Filter HIPERTENSI aktif: Analisis Natrium, Garam & Jantung');
            }

            renderProductHealthAdvice(product, activeFilter, detailElements);
        }

        if (detailElements.tagDiabetes) {
            detailElements.tagDiabetes.addEventListener('click', () => setDetailFilter('diabetes'));
        }
        if (detailElements.tagHipertensi) {
            detailElements.tagHipertensi.addEventListener('click', () => setDetailFilter('hipertensi'));
        }

        // Switch table view mode
        if (detailElements.tableModeToggleBtn) {
            detailElements.tableModeToggleBtn.addEventListener('click', () => {
                nutritionViewMode = (nutritionViewMode === 'status') ? 'nutrition' : 'status';
                if (nutritionViewMode === 'status') {
                    detailElements.statusTableView?.classList.remove('hidden');
                    detailElements.nutritionTableView?.classList.add('hidden');
                } else {
                    detailElements.statusTableView?.classList.add('hidden');
                    detailElements.nutritionTableView?.classList.remove('hidden');
                }
                showToast(`Tampilan tabel: ${nutritionViewMode === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'}`);
            });
        }

        // Report modal wiring
        function openDetailReport() {
            detailElements.reportModal?.classList.remove('hidden');
            detailElements.reportModal?.classList.add('flex');
            detailElements.reportTextarea?.focus();
        }

        function closeDetailReport() {
            detailElements.reportModal?.classList.add('hidden');
            detailElements.reportModal?.classList.remove('flex');
            if (detailElements.reportTextarea) {
                detailElements.reportTextarea.value = '';
            }
        }

        if (detailElements.openReportBtn) {
            detailElements.openReportBtn.addEventListener('click', openDetailReport);
        }
        if (detailElements.closeReportBtn) {
            detailElements.closeReportBtn.addEventListener('click', closeDetailReport);
        }
        if (detailElements.reportModal) {
            detailElements.reportModal.addEventListener('click', (e) => {
                if (e.target === detailElements.reportModal) closeDetailReport();
            });
        }
        if (detailElements.reportForm) {
            detailElements.reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = detailElements.reportTextarea?.value.trim();
                if (!text) {
                    showToast('Mohon tuliskan deskripsi ketidaksesuaian produk');
                    return;
                }
                closeDetailReport();
                showToast('Laporan ketidaksesuaian produk berhasil dikirim!');
            });
        }
    }

    // ----------------------------------------------------
    // 5. Module C: Scan Barcode Page (/scan-barcode)
    // ----------------------------------------------------
    const scanTriggerBtn = document.getElementById('scanTriggerBtn');
    if (scanTriggerBtn) {
        const scannerState = {
            activeTab: 'camera',
            cameraActive: false,
            activeProductIndex: 0,
            activeFilter: 'diabetes',
            nutritionViewMode: 'status',
        };

        const scannerElements = {
            videoElement: document.getElementById('cameraFeed'),
            mockCameraView: document.getElementById('mockCameraView'),
            liveCameraContainer: document.getElementById('liveCameraContainer'),
            tabCameraBtn: document.getElementById('tabCameraBtn'),
            tabGalleryBtn: document.getElementById('tabGalleryBtn'),
            galleryFileInput: document.getElementById('galleryFileInput'),
            galleryPreviewContainer: document.getElementById('galleryPreviewContainer'),
            galleryImagePreview: document.getElementById('galleryImagePreview'),
            scanTriggerBtn: scanTriggerBtn,
            laserElement: document.getElementById('scannerLaser'),

            // Modals
            reportModal: document.getElementById('reportModal'),
            openReportBtn: document.getElementById('openReportBtn'),
            closeReportBtn: document.getElementById('closeReportBtn'),
            reportForm: document.getElementById('reportForm'),
            reportTextarea: document.getElementById('reportTextarea'),

            // Product Details
            productTitle: document.getElementById('productTitle'),
            productBadge: document.getElementById('productBadge'),
            productThumbBox: document.getElementById('productThumbBox'),
            productThumbInitials: document.getElementById('productThumbInitials'),
            productThumbTitle: document.getElementById('productThumbTitle'),
            productThumbSub: document.getElementById('productThumbSub'),
            safePointsList: document.getElementById('safePointsList'),
            warningPointsList: document.getElementById('warningPointsList'),
            warningSection: document.getElementById('warningSection'),
            statusTableBody: document.getElementById('statusTableBody'),
            statusTableView: document.getElementById('statusTableView'),
            nutritionTableView: document.getElementById('nutritionTableView'),
            nutritionTableBody: document.getElementById('nutritionTableBody'),
            tableModeToggleBtn: document.getElementById('tableModeToggleBtn'),

            // Health tags
            tagDiabetes: document.getElementById('tagDiabetes'),
            tagHipertensi: document.getElementById('tagHipertensi'),

            // Left sidebar tools
            audioReadBtn: document.getElementById('audioReadBtn'),
            searchModalBtn: document.getElementById('searchModalBtn'),
            settingsModalBtn: document.getElementById('settingsModalBtn'),
            dtToggleBtn: document.getElementById('dtToggleBtn'),

            // Search modal
            searchModal: document.getElementById('searchModal'),
            closeSearchBtn: document.getElementById('closeSearchBtn'),
            searchInput: document.getElementById('searchInput'),
            searchResultsList: document.getElementById('searchResultsList'),
        };

        let mediaStream = null;

        function renderScannerProduct(index) {
            scannerState.activeProductIndex = index;
            const product = products[index];

            if (scannerElements.productTitle) {
                scannerElements.productTitle.textContent = product.name;
            }

            if (scannerElements.productThumbBox && product.thumb) {
                scannerElements.productThumbBox.style.backgroundColor = product.thumb.bg;
                if (scannerElements.productThumbInitials) scannerElements.productThumbInitials.textContent = product.thumb.initials;
                if (scannerElements.productThumbTitle) scannerElements.productThumbTitle.textContent = product.thumb.title;
                if (scannerElements.productThumbSub) scannerElements.productThumbSub.textContent = product.thumb.sub;
            }

            renderProductHealthAdvice(product, scannerState.activeFilter, scannerElements);
        }

        function setScannerFilter(filterName) {
            if (scannerState.activeFilter === filterName) {
                showToast(`Filter ${filterName.toUpperCase()} sedang aktif.`);
                return;
            }

            scannerState.activeFilter = filterName;

            if (filterName === 'diabetes') {
                scannerElements.tagDiabetes?.classList.remove('bg-white');
                scannerElements.tagDiabetes?.classList.add('bg-[#00D084]');
                scannerElements.tagDiabetes?.setAttribute('aria-checked', 'true');
                scannerElements.tagHipertensi?.classList.remove('bg-[#00D084]');
                scannerElements.tagHipertensi?.classList.add('bg-white');
                scannerElements.tagHipertensi?.setAttribute('aria-checked', 'false');
                showToast('Filter DIABETES aktif: Menampilkan analisis Gula & Karbohidrat');
            } else if (filterName === 'hipertensi') {
                scannerElements.tagHipertensi?.classList.remove('bg-white');
                scannerElements.tagHipertensi?.classList.add('bg-[#00D084]');
                scannerElements.tagHipertensi?.setAttribute('aria-checked', 'true');
                scannerElements.tagDiabetes?.classList.remove('bg-[#00D084]');
                scannerElements.tagDiabetes?.classList.add('bg-white');
                scannerElements.tagDiabetes?.setAttribute('aria-checked', 'false');
                showToast('Filter HIPERTENSI aktif: Menampilkan analisis Natrium, Garam & Tekanan Darah');
            }

            const product = products[scannerState.activeProductIndex];
            renderProductHealthAdvice(product, scannerState.activeFilter, scannerElements);
        }

        if (scannerElements.tagDiabetes) {
            scannerElements.tagDiabetes.addEventListener('click', () => setScannerFilter('diabetes'));
        }

        if (scannerElements.tagHipertensi) {
            scannerElements.tagHipertensi.addEventListener('click', () => setScannerFilter('hipertensi'));
        }

        function setScannerNutritionView(mode) {
            scannerState.nutritionViewMode = mode;
            if (mode === 'status') {
                scannerElements.statusTableView?.classList.remove('hidden');
                scannerElements.nutritionTableView?.classList.add('hidden');
            } else {
                scannerElements.statusTableView?.classList.add('hidden');
                scannerElements.nutritionTableView?.classList.remove('hidden');
            }
        }

        if (scannerElements.dtToggleBtn) {
            scannerElements.dtToggleBtn.addEventListener('click', () => {
                const nextMode = scannerState.nutritionViewMode === 'status' ? 'nutrition' : 'status';
                setScannerNutritionView(nextMode);
                showToast(`Beralih ke tampilan: ${nextMode === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'}`);
            });
        }

        if (scannerElements.tableModeToggleBtn) {
            scannerElements.tableModeToggleBtn.addEventListener('click', () => {
                const nextMode = scannerState.nutritionViewMode === 'status' ? 'nutrition' : 'status';
                setScannerNutritionView(nextMode);
            });
        }

        // Camera Management
        async function startCamera() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showToast('Browser tidak mendukung akses kamera langsung. Menampilkan simulasi.');
                return;
            }

            try {
                if (mediaStream) {
                    stopCamera();
                }

                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (scannerElements.videoElement) {
                    scannerElements.videoElement.srcObject = mediaStream;
                    scannerElements.videoElement.play();
                    scannerState.cameraActive = true;
                    scannerElements.liveCameraContainer?.classList.remove('hidden');
                    scannerElements.mockCameraView?.classList.add('hidden');
                    showToast('Kamera aktif! Arahkan ke barcode produk.');
                }
            } catch (err) {
                console.warn('Akses kamera tidak tersedia:', err);
                scannerElements.liveCameraContainer?.classList.add('hidden');
                scannerElements.mockCameraView?.classList.remove('hidden');
                showToast('Mode simulasi scanner barcode aktif.');
            }
        }

        function stopCamera() {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                mediaStream = null;
                scannerState.cameraActive = false;
            }
        }

        if (scannerElements.tabCameraBtn && scannerElements.tabGalleryBtn) {
            scannerElements.tabCameraBtn.addEventListener('click', () => {
                scannerState.activeTab = 'camera';
                scannerElements.tabCameraBtn.classList.remove('bg-white');
                scannerElements.tabCameraBtn.classList.add('bg-[#00D084]');
                scannerElements.tabGalleryBtn.classList.remove('bg-[#00D084]');
                scannerElements.tabGalleryBtn.classList.add('bg-white');

                scannerElements.galleryPreviewContainer?.classList.add('hidden');
                if (scannerState.cameraActive && mediaStream) {
                    scannerElements.liveCameraContainer?.classList.remove('hidden');
                    scannerElements.mockCameraView?.classList.add('hidden');
                } else {
                    scannerElements.mockCameraView?.classList.remove('hidden');
                }
            });

            scannerElements.tabGalleryBtn.addEventListener('click', () => {
                scannerState.activeTab = 'gallery';
                scannerElements.tabGalleryBtn.classList.remove('bg-white');
                scannerElements.tabGalleryBtn.classList.add('bg-[#00D084]');
                scannerElements.tabCameraBtn.classList.remove('bg-[#00D084]');
                scannerElements.tabCameraBtn.classList.add('bg-white');

                if (scannerElements.galleryFileInput) {
                    scannerElements.galleryFileInput.click();
                }
            });
        }

        if (scannerElements.galleryFileInput) {
            scannerElements.galleryFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (scannerElements.galleryImagePreview) {
                            scannerElements.galleryImagePreview.src = event.target.result;
                            scannerElements.galleryPreviewContainer?.classList.remove('hidden');
                            scannerElements.liveCameraContainer?.classList.add('hidden');
                            scannerElements.mockCameraView?.classList.add('hidden');
                            showToast('Foto barcode berhasil diunggah!');
                            simulateScan();
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        function simulateScan() {
            if (scannerElements.laserElement) {
                scannerElements.laserElement.style.display = 'block';
            }

            showToast('Memindai barcode...');

            setTimeout(() => {
                const nextIndex = (scannerState.activeProductIndex + 1) % products.length;
                renderScannerProduct(nextIndex);
                showToast(`Produk terdeteksi: ${products[nextIndex].name}`);
            }, 700);
        }

        scanTriggerBtn.addEventListener('click', () => {
            simulateScan();
        });

        // Report Modal Wiring
        function openReportModal() {
            if (!scannerElements.reportModal) return;
            scannerElements.reportModal.classList.remove('hidden');
            scannerElements.reportModal.classList.add('flex');
            scannerElements.reportTextarea?.focus();
        }

        function closeReportModal() {
            if (!scannerElements.reportModal) return;
            scannerElements.reportModal.classList.add('hidden');
            scannerElements.reportModal.classList.remove('flex');
            if (scannerElements.reportTextarea) {
                scannerElements.reportTextarea.value = '';
            }
        }

        if (scannerElements.openReportBtn) {
            scannerElements.openReportBtn.addEventListener('click', openReportModal);
        }
        if (scannerElements.closeReportBtn) {
            scannerElements.closeReportBtn.addEventListener('click', closeReportModal);
        }
        if (scannerElements.reportModal) {
            scannerElements.reportModal.addEventListener('click', (e) => {
                if (e.target === scannerElements.reportModal) closeReportModal();
            });
        }
        if (scannerElements.reportForm) {
            scannerElements.reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = scannerElements.reportTextarea ? scannerElements.reportTextarea.value.trim() : '';
                if (!text) {
                    showToast('Mohon isi deskripsi ketidaksesuaian produk');
                    return;
                }
                closeReportModal();
                showToast('Laporan berhasil dikirim! Terima kasih atas bantuan Anda.');
            });
        }

        // Audio TTS
        if (scannerElements.audioReadBtn) {
            scannerElements.audioReadBtn.addEventListener('click', () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const currentProduct = products[scannerState.activeProductIndex];
                    const advice = currentProduct[scannerState.activeFilter] || currentProduct.diabetes;
                    const textToRead = `${currentProduct.name}. Analisis kondisi ${scannerState.activeFilter}. Status keamanan: ${advice.badge}. Peringatan: ${advice.warningPoints.join('. ')}.`;
                    const utterance = new SpeechSynthesisUtterance(textToRead);
                    utterance.lang = 'id-ID';
                    utterance.rate = 1.0;
                    window.speechSynthesis.speak(utterance);
                    showToast(`🔊 Membacakan analisis ${scannerState.activeFilter.toUpperCase()}...`);
                } else {
                    showToast('Fitur Text-to-Speech tidak didukung di perangkat ini.');
                }
            });
        }

        // Search Switcher Modal
        function openSearchModal() {
            if (!scannerElements.searchModal) return;
            scannerElements.searchModal.classList.remove('hidden');
            scannerElements.searchModal.classList.add('flex');
            renderSearchResults('');
            scannerElements.searchInput?.focus();
        }

        function closeSearchModal() {
            if (!scannerElements.searchModal) return;
            scannerElements.searchModal.classList.add('hidden');
            scannerElements.searchModal.classList.remove('flex');
        }

        function renderSearchResults(query = '') {
            if (!scannerElements.searchResultsList) return;
            const q = query.toLowerCase().trim();
            const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));

            if (filtered.length === 0) {
                scannerElements.searchResultsList.innerHTML = `
                    <div class="py-6 text-center text-sm font-bold text-gray-500">
                        Tidak ada produk yang cocok dengan "${query}"
                    </div>
                `;
                return;
            }

            scannerElements.searchResultsList.innerHTML = filtered.map((prod) => `
                <div data-product-id="${prod.id}" class="search-item p-3 border-2 border-black rounded-xl bg-white hover:bg-[#E6F1EA] cursor-pointer brutal-shadow-sm brutal-btn flex items-center justify-between transition-all">
                    <div>
                        <h4 class="font-bold text-sm text-black">${prod.name}</h4>
                        <span class="text-xs text-gray-600 font-medium">${prod.brand} • ${prod.category}</span>
                    </div>
                    <span class="px-2 py-0.5 text-xs font-black rounded brutal-border-sm" style="background-color: ${prod.diabetes.badgeBg}">
                        ${prod.diabetes.badge}
                    </span>
                </div>
            `).join('');

            scannerElements.searchResultsList.querySelectorAll('.search-item').forEach((item) => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-product-id');
                    const targetIdx = products.findIndex(p => p.id === id);
                    if (targetIdx !== -1) {
                        renderScannerProduct(targetIdx);
                        closeSearchModal();
                        showToast(`Beralih ke: ${products[targetIdx].name}`);
                    }
                });
            });
        }

        if (scannerElements.searchModalBtn) {
            scannerElements.searchModalBtn.addEventListener('click', openSearchModal);
        }
        if (scannerElements.closeSearchBtn) {
            scannerElements.closeSearchBtn.addEventListener('click', closeSearchModal);
        }
        if (scannerElements.searchInput) {
            scannerElements.searchInput.addEventListener('input', (e) => {
                renderSearchResults(e.target.value);
            });
        }
        if (scannerElements.settingsModalBtn) {
            scannerElements.settingsModalBtn.addEventListener('click', () => {
                showToast('⚙️ Pengaturan: Sensitivitas pemindai telah disetel ke otomatis.');
            });
        }

        // Global Escape closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeReportModal();
                closeSearchModal();
            }
        });

        // Initial Scanner Render
        renderScannerProduct(0);
    }
});
