<div class="w-full flex flex-col gap-1.5">

    <!-- Table Header Actions (Allows seamless toggle between Image 1 and Image 2 styles) -->
    <div class="flex items-center justify-end">
        <button id="tableModeToggleBtn" type="button" class="text-[11px] font-black uppercase text-gray-700 hover:text-black underline cursor-pointer">
            Ganti Tampilan Tabel (Status / Info Gizi)
        </button>
    </div>

    <!-- View 1: Status Table (Image 1 Style with Yellow Header) -->
    <div id="statusTableView" class="w-full bg-white brutal-border brutal-shadow rounded-xl overflow-hidden">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-[#FFD027] border-b-2 border-black text-black font-black text-xs sm:text-sm uppercase tracking-wider">
                    <th class="py-2.5 px-3 w-1/3">ZAT GIZI</th>
                    <th class="py-2.5 px-3 w-1/3 text-center">STATUS</th>
                    <th class="py-2.5 px-3 w-1/3 text-right">JUMLAH</th>
                </tr>
            </thead>
            <tbody id="statusTableBody" class="divide-y-2 divide-black">
                <!-- Initial Mock Values (Hydrated/Updated dynamically via app.js) -->
                <tr class="border-b-2 border-black">
                    <td class="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">Gula</td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm bg-[#FF4D4D] text-white">
                            TIDAK AMAN
                        </span>
                    </td>
                    <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">24 g</td>
                </tr>
                <tr class="border-b-2 border-black">
                    <td class="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">Garam/Natrium</td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm bg-[#FFD027] text-black">
                            WASPADA GULA
                        </span>
                    </td>
                    <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">200 mg</td>
                </tr>
                <tr class="border-b-2 border-black">
                    <td class="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">Lemak Total</td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm bg-[#00D084] text-black">
                            AMAN
                        </span>
                    </td>
                    <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">4.0 g</td>
                </tr>
                <tr class="border-b-2 border-black">
                    <td class="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">Lemak Jenuh</td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm bg-[#00D084] text-black">
                            AMAN
                        </span>
                    </td>
                    <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">2.0 g</td>
                </tr>
                <tr>
                    <td class="py-2.5 px-3 text-xs sm:text-sm font-bold text-black">Kalori</td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="inline-block px-3 py-1 brutal-border-sm rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider brutal-shadow-sm bg-[#00D084] text-black">
                            AMAN
                        </span>
                    </td>
                    <td class="py-2.5 px-3 text-right text-xs sm:text-sm font-bold text-black">180 kkal</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- View 2: Informasi Nilai Gizi (Image 2 Style) -->
    <div id="nutritionTableView" class="w-full bg-white brutal-border brutal-shadow rounded-xl p-4 hidden">
        <h3 class="text-center font-black text-sm uppercase tracking-wide text-black pb-2 mb-2 border-b-2 border-black">
            Informasi Nilai Gizi
        </h3>
        <table class="w-full text-left">
            <thead>
                <tr class="border-b-2 border-black/20 text-xs font-bold text-gray-700">
                    <th class="py-1.5 px-2">Zat gizi</th>
                    <th class="py-1.5 px-2 text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody id="nutritionTableBody">
                <tr class="border-b border-black/10">
                    <td class="py-1.5 px-2 text-xs font-semibold text-gray-800">Kalori</td>
                    <td class="py-1.5 px-2 text-right text-xs font-bold text-black">180 kkal</td>
                </tr>
                <tr class="border-b border-black/10">
                    <td class="py-1.5 px-2 text-xs font-semibold text-gray-800">Karbohidrat</td>
                    <td class="py-1.5 px-2 text-right text-xs font-bold text-black">30 g</td>
                </tr>
                <tr class="border-b border-black/10">
                    <td class="py-1.5 px-2 text-xs font-semibold text-gray-800">Gula</td>
                    <td class="py-1.5 px-2 text-right text-xs font-bold text-black">12 g</td>
                </tr>
                <tr class="border-b border-black/10">
                    <td class="py-1.5 px-2 text-xs font-semibold text-gray-800">Natrium</td>
                    <td class="py-1.5 px-2 text-right text-xs font-bold text-black">200 mg</td>
                </tr>
                <tr>
                    <td class="py-1.5 px-2 text-xs font-semibold text-gray-800">Garam</td>
                    <td class="py-1.5 px-2 text-right text-xs font-bold text-black">0,5 g</td>
                </tr>
            </tbody>
        </table>
    </div>

</div>

