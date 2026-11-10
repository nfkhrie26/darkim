@props([
    'productId' => 'ultra-milk',
])

<x-layout title="DARKIM - Detail & Informasi Nilai Gizi Produk">
    <x-header />
    <!-- Top Navigation Bar: Back Button & Header Branding (No Sidebar) -->
    <header class="w-full max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <!-- Back Button (Top-Left) -->
        <a 
            href="{{ route('katalog.index') }}" 
            class="inline-flex items-center gap-2 bg-white brutal-border brutal-shadow rounded-xl px-4 py-2.5 font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer"
            title="Kembali ke Katalog Produk"
        >
            <!-- Back Arrow SVG -->
            <svg class="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>KEMBALI KE KATALOG</span>
        </a>
    </header>

    <!-- Shopee-like 2-Column Product Detail Layout (Left: Image Gallery, Right: Nutrition Details) -->
    <main class="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-6 items-start" data-product-id="{{ $productId }}">

        <!-- Left Column: Product Image Showcase & Quick Actions -->
        <section class="w-full lg:w-[460px] shrink-0 flex flex-col gap-4">
            
            <!-- Main Hero Image Card -->
            <div class="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 flex flex-col">
                <div id="detailHeroBox" class="w-full aspect-[4/3] bg-gradient-to-br from-[#1d2731] to-[#0f151c] brutal-border-sm rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center relative select-none">
                    <!-- Brand Icon/Initial -->
                    <div class="w-14 h-14 rounded-full border-2 border-amber-300 flex items-center justify-center mb-3 shadow-md bg-black/40">
                        <span id="detailThumbInitials" class="text-lg font-black text-amber-300">UM</span>
                    </div>
                    <span id="detailThumbTitle" class="text-base sm:text-lg font-black text-white leading-tight uppercase tracking-tight">ULTRA MILK</span>
                    <span id="detailThumbSub" class="text-xs font-bold text-sky-300 tracking-wider mt-1 uppercase">SUSU UHT COKELAT</span>

                    <!-- Decorative Barcode at Bottom -->
                    <div class="absolute bottom-3 inset-x-8 bg-white/90 rounded px-3 py-1 flex items-center justify-center gap-1 shadow">
                        <div class="w-1 h-4 bg-black"></div>
                        <div class="w-2 h-4 bg-black"></div>
                        <div class="w-0.5 h-4 bg-black"></div>
                        <div class="w-1.5 h-4 bg-black"></div>
                        <div class="w-3 h-4 bg-black"></div>
                        <div class="w-1 h-4 bg-black"></div>
                        <div class="w-2 h-4 bg-black"></div>
                        <span class="text-[10px] font-mono font-bold text-black ml-2 tracking-widest">8 992753 123456</span>
                    </div>
                </div>

                <!-- Product Attributes Pill Bar -->
                <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t-2 border-black/10 text-xs font-bold text-gray-700">
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-[#00D084]"></span>
                        Barcode Terverifikasi
                    </span>
                    <span id="detailCategoryPill" class="bg-gray-100 brutal-border-sm px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase text-black">
                        Minuman
                    </span>
                </div>
            </div>

            <!-- Report Button (Laporkan Ketidaksesuaian) -->
            <button id="openReportBtn" type="button" class="w-full bg-white brutal-border brutal-shadow rounded-xl py-3 px-4 flex items-center justify-center gap-2 brutal-btn cursor-pointer">
                <!-- Flag SVG -->
                <svg class="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span class="font-black text-xs uppercase tracking-wider text-black">
                    PRODUK TIDAK SESUAI? LAPORKAN PADA KAMI!
                </span>
            </button>

        </section>

        <!-- Right Column: Nutrition Table, Health Analysis & Disease Filters -->
        <section class="flex-1 w-full flex flex-col gap-4">

            <!-- Product Title & Brand Meta Box -->
            <div class="bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5 flex flex-col gap-1">
                <span id="detailBrandMeta" class="text-xs font-black uppercase tracking-wider text-gray-500">
                    Ultrajaya • Minuman UHT
                </span>
                <h1 id="productTitle" class="text-xl sm:text-2xl font-black text-black leading-tight">
                    Ultra Milk Susu UHT Rasa Cokelat Segar - 250ml
                </h1>
            </div>

            <!-- Health Filter Tags (Diabetes & Hipertensi - Mutually Exclusive) -->
            <div class="flex items-center gap-2.5 flex-wrap" role="radiogroup" aria-label="Filter Kondisi Kesehatan">
                <!-- Diabetes Badge -->
                <button id="tagDiabetes" type="button" role="radio" aria-checked="true" title="Tampilkan Analisis Khusus Diabetes" class="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1.5 text-xs font-black text-black uppercase tracking-wider brutal-btn cursor-pointer">
                    Diabetes
                </button>

                <!-- Hipertensi Badge -->
                <button id="tagHipertensi" type="button" role="radio" aria-checked="false" title="Tampilkan Analisis Khusus Hipertensi" class="bg-white brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1.5 text-xs font-black text-black uppercase tracking-wider brutal-btn cursor-pointer">
                    Hipertensi
                </button>
            </div>

            <!-- Warning & Health Advice Card -->
            <div id="warningSection" class="w-full flex flex-col items-start">
                <!-- Yellow Header Badge: HATI-HATI / AMAN / TIDAK AMAN -->
                <div id="productBadge" class="bg-[#FFD027] brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1 text-xs sm:text-sm font-black text-black uppercase tracking-wider mb-2">
                    HATI-HATI
                </div>

                <!-- Main Warning Advice Card -->
                <div class="w-full bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <!-- Left: Safe Points (Green Checkmarks) -->
                        <div id="safePointsList" class="flex flex-col gap-2.5">
                            <div class="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">✓</span>
                                <span>Tinggi Kalsium (300 mg) & Fosfor mendukung metabolisme dan densitas tulang</span>
                            </div>
                            <div class="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
                                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 text-[10px]">✓</span>
                                <span>Kandungan Protein Alami (6.0 g) bermanfaat bagi perbaikan sel jaringan</span>
                            </div>
                        </div>

                        <!-- Right: Warning Points (Yellow Warning Icon) -->
                        <div id="warningPointsList" class="flex flex-col gap-2.5 md:border-l-2 md:border-black/10 md:pl-4">
                            <div class="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
                                <span class="text-amber-500 text-base shrink-0 leading-none">⚠️</span>
                                <span>Perhatian Diabetes: Gula Total 18.0 g (Tinggi)! Berisiko memicu lonjakan glukosa darah penderita Diabetes</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Nutrition Table (Switchable: Status Mode vs Informasi Nilai Gizi Mode) -->
            <x-nutrition-table />

        </section>

    </main>

    <!-- Modals & Overlays -->
    <x-report-modal />
    <x-toast />

</x-layout>

