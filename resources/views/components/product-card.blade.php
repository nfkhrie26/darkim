@props([
    'id' => 'ultra-milk',
    'name' => 'Ultra Milk 250ml',
    'category' => 'Minuman',
    'image' => null,
    'badge' => null,
])

<div class="product-item bg-white brutal-border brutal-shadow rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5" data-category="{{ strtolower($category) }}" data-name="{{ strtolower($name) }}">
    <div>
        <!-- Product Thumbnail Box -->
        <div class="w-full aspect-[16/9] bg-[#1a232b] brutal-border-sm rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
            @if ($image)
                <img src="{{ $image }}" alt="{{ $name }}" class="w-full h-full object-cover">
            @else
                <!-- Mock Graphic / Illustration Placeholder -->
                <div class="w-full h-full bg-gradient-to-br from-[#2a3744] to-[#121921] flex flex-col items-center justify-center p-3 relative select-none">
                    <span class="text-xs font-black uppercase tracking-widest text-amber-300">DARKIM</span>
                    <span class="text-[11px] font-bold text-white/90 text-center leading-tight mt-1 line-clamp-1">{{ $name }}</span>
                    <!-- Barcode pattern at bottom of thumbnail -->
                    <div class="absolute bottom-1.5 inset-x-4 h-3 bg-white/10 rounded flex items-center justify-center gap-0.5 opacity-60">
                        <div class="w-1 h-2 bg-white"></div>
                        <div class="w-0.5 h-2 bg-white"></div>
                        <div class="w-1.5 h-2 bg-white"></div>
                        <div class="w-0.5 h-2 bg-white"></div>
                        <div class="w-1 h-2 bg-white"></div>
                    </div>
                </div>
            @endif
        </div>

        <!-- Product Name & Category -->
        <h3 class="text-sm sm:text-base font-black text-black leading-snug line-clamp-1 mb-0.5">
            {{ $name }}
        </h3>
        <p class="text-xs font-semibold text-gray-500 mb-4">
            {{ $category }}
        </p>
    </div>

    <!-- Action Button (INFORMASI GIZI) -->
    <div class="flex justify-end pt-2">
        <a 
            href="{{ route('produk.show', $id) }}" 
            class="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black brutal-btn inline-flex items-center justify-center cursor-pointer"
        >
            INFORMASI GIZI
        </a>
    </div>
</div>

