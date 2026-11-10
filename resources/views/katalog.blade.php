<x-layout title="DARKIM - Katalog Produk Makanan & Minuman">

    <!-- Top Header & Branding -->
    <x-header />

    <!-- Main Content Area -->
    <main class="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        
        <!-- Left Vertical Floating Sidebar (Active on Search) -->
        <x-sidebar active="search" />

        <!-- Right Content: Catalog Section -->
        <section class="flex-1 w-full flex flex-col gap-5">

            <!-- Search Bar & 3-Categories Dropdown -->
            <x-catalog-search-bar />

            <!-- Product Grid (3 columns on desktop, matching screenshot) -->
            <div id="catalogGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <x-product-card 
                    id="ultra-milk" 
                    name="Ultra Milk 250ml" 
                    category="Minuman" 
                />
                <x-product-card 
                    id="koko-krunch" 
                    name="Koko Krunch Sereal 170g" 
                    category="Makanan" 
                />
                <x-product-card 
                    id="teh-botol" 
                    name="Teh Botol Sosro 250ml" 
                    category="Minuman" 
                />
                <x-product-card 
                    id="indomie-goreng" 
                    name="Indomie Mi Goreng 85g" 
                    category="Makanan" 
                />
                <x-product-card 
                    id="bear-brand" 
                    name="Susu Bear Brand 189ml" 
                    category="Minuman" 
                />
                <x-product-card 
                    id="oreo-vanilla" 
                    name="Oreo Biskuit Vanilla 133g" 
                    category="Makanan" 
                />
            </div>

            <!-- Empty State (Shown if search yields 0 matches) -->
            <div id="catalogEmptyState" class="hidden bg-white brutal-border brutal-shadow rounded-2xl p-8 text-center my-4">
                <p class="font-black text-base text-black mb-1">Tidak ada produk yang cocok dengan pencarian.</p>
                <p class="text-xs font-semibold text-gray-500">Coba gunakan kata kunci lain atau pilih "Semua Kategori".</p>
            </div>

            <!-- Pagination Bar -->
            <x-pagination />

        </section>

    </main>

    <!-- Modals & Overlays -->
    <x-toast />

</x-layout>

