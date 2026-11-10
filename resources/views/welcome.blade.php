<x-layout title="DARKIM - Platform Informasi Makanan & Minuman">
    <div class="min-h-[85vh] flex flex-col items-center justify-center text-center px-4">
        
        <!-- Branding Logo Card -->
        <div class="bg-white brutal-border brutal-shadow rounded-2xl px-6 py-4 inline-flex items-center gap-2 mb-6">
            <span class="text-4xl sm:text-5xl font-black tracking-tight text-black">DARK</span>
            <span class="text-4xl sm:text-5xl font-black tracking-tight text-[#00D084] relative">
                IM
                <span class="absolute -bottom-1.5 left-0 right-0 h-2 bg-[#00D084] rounded-full"></span>
            </span>
        </div>

        <!-- Tagline Banner -->
        <div class="bg-white brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-2 mb-8 max-w-md">
            <p class="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                LIHAT INFORMASI MAKANAN DAN MINUMAN SEBELUM KONSUMSI
            </p>
        </div>

        <!-- 1 Primary Navigation Button -->
        <div>
            <a href="{{ route('scan.barcode') }}" class="inline-flex items-center gap-3 bg-[#00D084] brutal-border-lg brutal-shadow-lg rounded-2xl px-8 py-4 sm:px-10 sm:py-5 font-black text-base sm:text-lg uppercase tracking-wider text-black brutal-btn cursor-pointer">
                <!-- Camera / Barcode Scan SVG Icon -->
                <svg class="w-6 h-6 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
                <span>PINDAI BARCODE SEKARANG</span>
                <!-- Arrow Right SVG -->
                <svg class="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </a>
        </div>

    </div>
</x-layout>
