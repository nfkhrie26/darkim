<section class="w-full lg:w-[420px] shrink-0 flex flex-col gap-3.5">

    <!-- Yellow Guide Banner -->
    <div class="w-full bg-[#FFD027] brutal-border brutal-shadow rounded-xl py-2.5 px-4 flex items-center justify-center gap-2.5">
        <!-- Barcode Icon -->
        <svg class="w-6 h-6 text-black shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="5" width="2" height="14" />
            <rect x="5" y="5" width="1" height="14" />
            <rect x="7" y="5" width="3" height="14" />
            <rect x="12" y="5" width="1.5" height="14" />
            <rect x="15" y="5" width="2" height="14" />
            <rect x="18" y="5" width="1" height="14" />
            <rect x="20" y="5" width="2" height="14" />
        </svg>
        <span class="font-black text-xs sm:text-sm tracking-tight text-black">
            arahkan kamera anda pada barcode
        </span>
    </div>

    <!-- Scanner Box / Container Card -->
    <div class="w-full bg-white brutal-border brutal-shadow rounded-2xl p-3 flex flex-col gap-2.5">

        <!-- Viewfinder Top Bar / Tabs -->
        <div class="flex items-center gap-2">
            <!-- Camera Tab (Active) -->
            <button id="tabCameraBtn" type="button" title="Mode Kamera Langsung" class="w-9 h-9 rounded-lg bg-[#00D084] brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            </button>

            <!-- Gallery / Upload Tab -->
            <button id="tabGalleryBtn" type="button" title="Unggah Foto dari Galeri" class="w-9 h-9 rounded-lg bg-white brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer">
                <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            </button>
            <!-- Hidden file input for gallery upload -->
            <input type="file" id="galleryFileInput" accept="image/*" class="hidden">
        </div>

        <!-- Viewfinder Screen -->
        <div class="relative w-full aspect-[4/5] bg-black brutal-border rounded-xl overflow-hidden flex items-center justify-center select-none">

            <!-- Mode A: Realistic Mockup from Screenshot (Default) -->
            <div id="mockCameraView" class="absolute inset-0 w-full h-full">
                <!-- Supermarket shelf & hand holding smartphone scanning Koko Krunch barcode -->
                <div class="w-full h-full relative overflow-hidden bg-cover bg-center" style="background-image: radial-gradient(circle at center, #2e2b29 0%, #171514 100%);">
                    
                    <!-- Blurred background mockup representing supermarket aisle -->
                    <div class="absolute inset-0 opacity-40 mix-blend-luminosity flex flex-wrap gap-2 p-2 pointer-events-none filter blur-[1px]">
                        <div class="w-16 h-20 bg-amber-700/60 rounded"></div>
                        <div class="w-16 h-20 bg-red-600/60 rounded"></div>
                        <div class="w-16 h-20 bg-yellow-500/60 rounded"></div>
                        <div class="w-16 h-20 bg-blue-600/60 rounded"></div>
                        <div class="w-16 h-20 bg-amber-800/60 rounded"></div>
                        <div class="w-16 h-20 bg-red-700/60 rounded"></div>
                    </div>

                    <!-- Phone Mockup in Hand -->
                    <div class="absolute inset-x-7 inset-y-6 bg-[#111] border-4 border-gray-700 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col justify-between p-3.5">
                        <!-- Top status bar inside mock phone -->
                        <div class="flex items-center justify-between text-[10px] text-gray-400 font-mono px-1">
                            <span>10:42</span>
                            <span class="font-bold text-white tracking-wide">Pindai Barcode</span>
                            <span>📶 🔋</span>
                        </div>

                        <!-- Central Target Box scanning Koko Krunch Barcode -->
                        <div class="relative w-full flex-1 my-2 flex flex-col items-center justify-center">
                            
                            <!-- Barcode Package Graphic -->
                            <div class="w-48 bg-[#4a2612] border-2 border-amber-300 rounded-lg p-2 flex flex-col items-center shadow-lg">
                                <div class="text-[9px] font-black text-yellow-300 tracking-wider uppercase mb-1">NESTLÉ KOKO KRUNCH</div>
                                <div class="text-[8px] text-white/80 font-bold mb-1.5">Sereal Sarapan Cokelat</div>

                                <!-- The Barcode itself -->
                                <div class="bg-white px-3 py-1.5 rounded flex flex-col items-center shadow-inner relative">
                                    <svg class="w-36 h-12 text-black" viewBox="0 0 100 35" preserveAspectRatio="none">
                                        <rect x="0" y="0" width="3" height="30" fill="black" />
                                        <rect x="5" y="0" width="2" height="30" fill="black" />
                                        <rect x="9" y="0" width="4" height="30" fill="black" />
                                        <rect x="15" y="0" width="1" height="30" fill="black" />
                                        <rect x="18" y="0" width="3" height="30" fill="black" />
                                        <rect x="23" y="0" width="2" height="30" fill="black" />
                                        <rect x="27" y="0" width="5" height="30" fill="black" />
                                        <rect x="34" y="0" width="2" height="30" fill="black" />
                                        <rect x="38" y="0" width="1" height="30" fill="black" />
                                        <rect x="41" y="0" width="4" height="30" fill="black" />
                                        <rect x="47" y="0" width="2" height="30" fill="black" />
                                        <rect x="51" y="0" width="3" height="30" fill="black" />
                                        <rect x="56" y="0" width="1" height="30" fill="black" />
                                        <rect x="59" y="0" width="4" height="30" fill="black" />
                                        <rect x="65" y="0" width="2" height="30" fill="black" />
                                        <rect x="69" y="0" width="3" height="30" fill="black" />
                                        <rect x="74" y="0" width="1" height="30" fill="black" />
                                        <rect x="77" y="0" width="4" height="30" fill="black" />
                                        <rect x="83" y="0" width="2" height="30" fill="black" />
                                        <rect x="87" y="0" width="3" height="30" fill="black" />
                                        <rect x="92" y="0" width="2" height="30" fill="black" />
                                        <rect x="96" y="0" width="3" height="30" fill="black" />
                                    </svg>
                                    <span class="text-[9px] font-mono tracking-widest text-black mt-0.5">8 991234 567890</span>

                                    <!-- Center Aiming Point -->
                                    <span class="w-2.5 h-2.5 bg-red-600 rounded-full border border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm animate-ping"></span>
                                    <span class="w-2 h-2 bg-red-600 rounded-full border border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm"></span>
                                </div>
                            </div>

                            <!-- Focus Corner Brackets inside phone -->
                            <div class="absolute inset-2 pointer-events-none">
                                <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg shadow-sm"></div>
                                <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg shadow-sm"></div>
                                <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg shadow-sm"></div>
                                <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg shadow-sm"></div>
                            </div>
                        </div>

                        <!-- Text Helper inside mock phone -->
                        <p class="text-center text-[10px] text-white/80 font-medium mb-1">
                            Sejajarkan kode batang dalam bingkai
                        </p>
                    </div>
                </div>
            </div>

            <!-- Mode B: Live Camera Video Stream -->
            <div id="liveCameraContainer" class="absolute inset-0 w-full h-full hidden">
                <video id="cameraFeed" playsinline autoplay muted class="w-full h-full object-cover"></video>
            </div>

            <!-- Mode C: Gallery Preview (When file is uploaded) -->
            <div id="galleryPreviewContainer" class="absolute inset-0 w-full h-full hidden bg-black flex items-center justify-center p-2">
                <img id="galleryImagePreview" src="" alt="Uploaded barcode" class="max-h-full max-w-full object-contain rounded-lg">
            </div>

            <!-- Scanning Laser Line Animation -->
            <div id="scannerLaser" class="scanner-laser"></div>

            <!-- Outer Viewfinder Corner Brackets Overlay -->
            <div class="absolute inset-4 pointer-events-none z-10">
                <div class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div class="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div class="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>

            <!-- Floating Green Camera Shutter Button -->
            <button id="scanTriggerBtn" type="button" title="Pindai Sekarang" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-xl bg-[#00D084] brutal-border-sm brutal-shadow flex items-center justify-center brutal-btn cursor-pointer">
                <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            </button>
        </div>
    </div>

    <!-- Report Button (Below Scanner Card) -->
    <button id="openReportBtn" type="button" class="w-full bg-white brutal-border brutal-shadow rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 brutal-btn cursor-pointer">
        <!-- Flag Icon -->
        <svg class="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        <span class="font-black text-xs sm:text-xs tracking-wider uppercase text-black">
            PRODUK TIDAK SESUAI? LAPORKAN PADA KAMI!
        </span>
    </button>
</section>

