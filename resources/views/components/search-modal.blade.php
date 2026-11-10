<div id="searchModal" class="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 hidden items-center justify-center p-4">
    <div class="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-md relative">
        <button id="closeSearchBtn" type="button" class="absolute top-4 right-4 text-black hover:text-red-500 font-bold text-lg cursor-pointer transition-colors" title="Tutup">
            ✕
        </button>
        <h3 class="text-base font-black text-black mb-3">
            Cari Produk / Pilih Sampel Demo
        </h3>
        <div class="relative mb-3">
            <input 
                type="text" 
                id="searchInput" 
                placeholder="Ketik nama produk (mis: Koko Krunch, Ultra Milk)..." 
                class="w-full brutal-border-sm rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
            >
        </div>
        <div id="searchResultsList" class="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            <!-- Populated dynamically via app.js -->
        </div>
    </div>
</div>

