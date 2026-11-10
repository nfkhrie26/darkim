<div class="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <!-- Search Input Group -->
    <div class="flex-1 flex items-center gap-2">
        <div class="relative flex-1">
            <input 
                type="text" 
                id="catalogSearchInput" 
                placeholder="Cth: Scan ultra milk, tapi yang muncul bir bintang..." 
                class="w-full bg-white brutal-border brutal-shadow rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            >
        </div>

        <!-- Yellow Search Action Button -->
        <button 
            id="catalogSearchSubmitBtn" 
            type="button" 
            title="Cari Produk" 
            class="bg-[#FFD027] brutal-border brutal-shadow rounded-xl px-4 py-2.5 flex items-center justify-center brutal-btn cursor-pointer shrink-0"
        >
            <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" stroke-linecap="round" />
            </svg>
        </button>
    </div>

    <!-- 3 Categories Filter Dropdown -->
    <div class="relative shrink-0">
        <div class="bg-white brutal-border brutal-shadow rounded-xl px-3 py-1 flex items-center gap-2">
            <!-- Filter / Funnel Icon (Y) -->
            <select id="catalogCategoryFilter" class="bg-transparent font-black text-xs sm:text-sm uppercase tracking-wider text-black focus:outline-none py-1.5 cursor-pointer">
                <option value="all">ALL CATEGORIES</option>
                <option value="makanan">MAKANAN</option>
                <option value="minuman">MINUMAN</option>
            </select>
            <!-- Funnel SVG Icon -->
            <svg class="w-4 h-4 text-black shrink-0 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
        </div>
    </div>
</div>

