<div class="flex flex-col gap-4 w-full">

    <!-- Product Header: Image Thumbnail + Product Title Box -->
    <div class="flex items-center gap-3 w-full">
        <!-- Product Thumbnail (Matches Cigarette/Product Box in Screenshot) -->
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-white brutal-border brutal-shadow rounded-xl p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
            <div id="productThumbBox" class="w-full h-full bg-[#1b2b34] rounded-lg border border-black flex flex-col items-center justify-center p-1 text-center shadow-inner relative">
                <div class="w-5 h-5 rounded-full border border-amber-300 flex items-center justify-center mb-0.5">
                    <span id="productThumbInitials" class="text-[7px] text-amber-300 font-bold">BH</span>
                </div>
                <span id="productThumbTitle" class="text-[8px] font-black text-white leading-tight uppercase tracking-tighter">BANI HANYUT</span>
                <span id="productThumbSub" class="text-[6px] font-bold text-sky-300 tracking-tighter">BLUEBERRY</span>
            </div>
        </div>

        <!-- Product Name Box -->
        <div class="flex-1 bg-white brutal-border brutal-shadow rounded-xl px-4 py-3 flex items-center">
            <h2 id="productTitle" class="text-sm sm:text-base font-black text-black leading-snug">
                Rokok Bani Hanyut Rasa Blueberry - 250 batang
            </h2>
        </div>
    </div>

    <!-- Health Filter Tags (Diabetes, Hipertensi - Mutually Exclusive) -->
    <div class="flex items-center gap-2.5 flex-wrap" role="radiogroup" aria-label="Filter Kondisi Kesehatan">
        <!-- Diabetes Badge (Active / Green #00D084) -->
        <button id="tagDiabetes" type="button" role="radio" aria-checked="true" title="Tampilkan Analisis Khusus Diabetes" class="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-lg px-3.5 py-1 text-xs font-black text-black uppercase tracking-wider brutal-btn cursor-pointer">
            Diabetes
        </button>

        <!-- Hipertensi Badge (Inactive / White) -->
        <button id="tagHipertensi" type="button" role="radio" aria-checked="false" title="Tampilkan Analisis Khusus Hipertensi" class="bg-white brutal-border-sm brutal-shadow-sm rounded-lg px-3.5 py-1 text-xs font-black text-black uppercase tracking-wider brutal-btn cursor-pointer">
            Hipertensi
        </button>
    </div>

    <!-- Warning Card Section -->
    <div id="warningSection" class="w-full flex flex-col items-start">
        <!-- Yellow Header Badge: HATI-HATI -->
        <div id="productBadge" class="bg-[#FFD027] brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1 text-xs sm:text-sm font-black text-black uppercase tracking-wider mb-2">
            HATI-HATI
        </div>

        <!-- Main Warning & Health Advice Card -->
        <div class="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Left Column: Safe Points (Green Checkmarks) -->
                <div id="safePointsList" class="flex flex-col gap-2.5">
                    <div class="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                        <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">✓</span>
                        <span>Kandungan Natrium Rendah/Wajar (25.0 mg) Hanya menyumbang 1.2% dari batas harian</span>
                    </div>
                    <div class="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                        <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">✓</span>
                        <span>Kandungan Garam Rendah/Wajar (0.03 g), Hanya menyumbang 0.6% dari batas harian</span>
                    </div>
                    <div class="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                        <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">✓</span>
                        <span>Kandungan Lemak Total Rendah/Wajar (4.0 g), Hanya menyumbang 7.2% dari batas harian</span>
                    </div>
                </div>

                <!-- Right Column: Warning Points (Yellow Warning Icon) -->
                <div id="warningPointsList" class="flex flex-col gap-2.5 md:border-l-2 md:border-black/10 md:pl-4">
                    <div class="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
                        <span class="text-amber-500 text-base shrink-0 leading-none">⚠️</span>
                        <span>Perlu Membatasi Lemak Jenuh (2.0 g), Mengandung 12.8% dari batas maksimal harian</span>
                    </div>
                </div>

            </div>
        </div>
    </div>

</div>

