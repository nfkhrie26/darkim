<x-layout title="DARKIM - Pindai Barcode & Analisis Nilai Gizi">
    
    <!-- Top Header & Branding -->
    <x-header />

    <!-- Main Content Area -->
    <main class="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        
        <!-- Left Vertical Floating Sidebar -->
        <x-sidebar />

        <!-- Center Column: Barcode Scanner Viewfinder -->
        <x-scanner />

        <!-- Right Column: Product Details & Nutritional Value Analysis -->
        <section class="flex-1 w-full flex flex-col gap-4">
            <x-product-info />
            <x-nutrition-table />
        </section>

    </main>

    <!-- Modals & Overlays -->
    <x-report-modal />
    <x-search-modal />
    <x-toast />

</x-layout>

