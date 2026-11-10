<div id="reportModal" class="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 hidden items-center justify-center p-4">
    <div class="bg-white brutal-border-lg brutal-shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Close Button (X) -->
        <button id="closeReportBtn" type="button" class="absolute top-4 right-4 text-black hover:text-red-500 font-bold text-lg cursor-pointer transition-colors" title="Tutup">
            ✕
        </button>

        <!-- Modal Title -->
        <h3 class="text-base sm:text-lg font-black text-black mb-3">
            Laporkan Ketidaksesuaian Produk
        </h3>

        <!-- Report Form -->
        <form id="reportForm" class="flex flex-col gap-4">
            <!-- Textarea with exact placeholder from Image 2 -->
            <textarea 
                id="reportTextarea" 
                rows="5" 
                placeholder="Cth: Scan ultra milk, tapi yang muncul bir bintang..." 
                class="w-full brutal-border-sm rounded-xl p-3.5 text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black resize-none bg-white placeholder:text-gray-400"
                required
            ></textarea>

            <!-- Submit Button (Green - Right Aligned as in Image 2) -->
            <div class="flex justify-end">
                <button type="submit" class="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-5 py-2 text-xs font-black uppercase tracking-wider text-black brutal-btn cursor-pointer">
                    KIRIM LAPORAN
                </button>
            </div>
        </form>

    </div>
</div>

