'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HealthProfile, ScanApiResponse } from '@/types';

interface CameraScannerProps {
  onScanImage: (file: File, mode?: 'fast' | 'deep') => void;
  onScanSuccess?: (data: ScanApiResponse) => void;
  onBarcodeNotFound?: (barcode: string) => void;
  onTriggerScanMock?: () => void;
  onOpenReport: () => void;
  isScanning?: boolean;
  selectedProfile?: HealthProfile;
}

// Native Zero-Dependency Web Audio API synthesizer for barcode scan confirmation
function playBeepSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // AudioContext might be restricted until user gesture; safe to ignore
  }
}

export default function CameraScanner({
  onScanImage,
  onScanSuccess,
  onBarcodeNotFound,
  onTriggerScanMock,
  onOpenReport,
  isScanning = false,
  selectedProfile = 'diabetes',
}: CameraScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'photo'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Auto-scan state
  const [isAutoScanPaused, setIsAutoScanPaused] = useState<boolean>(false);
  const [lastDetectedBarcode, setLastDetectedBarcode] = useState<string | null>(null);
  const [scanSuccessFlash, setScanSuccessFlash] = useState<boolean>(false);
  const [fpsIndicator, setFpsIndicator] = useState<string>('Siap');

  // References to prevent race conditions and manage hardware
  const activeTabRef = useRef<'camera' | 'photo'>('camera');
  const cameraRequestIdRef = useRef<number>(0);
  const activeStreamsRef = useRef<Set<MediaStream>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time loop control refs
  const isAutoScanPausedRef = useRef<boolean>(false);
  const isProcessingFrameRef = useRef<boolean>(false);
  const lastScannedBarcodeRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Uploaded photo state from gallery tab
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  // Synchronize state to refs
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    isAutoScanPausedRef.current = isAutoScanPaused;
  }, [isAutoScanPaused]);

  // Complete cleanup and hardware release for camera
  const stopCamera = useCallback(() => {
    cameraRequestIdRef.current++;

    if (autoScanTimerRef.current) {
      clearInterval(autoScanTimerRef.current);
      autoScanTimerRef.current = null;
    }

    activeStreamsRef.current.forEach((stream) => {
      try {
        stream.getTracks().forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch {}
        });
      } catch {}
    });
    activeStreamsRef.current.clear();

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch {}
        });
      } catch {}
      streamRef.current = null;
    }

    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const srcStream = videoRef.current.srcObject as MediaStream;
        if (srcStream && typeof srcStream.getTracks === 'function') {
          srcStream.getTracks().forEach((track) => {
            try {
              track.enabled = false;
              track.stop();
            } catch {}
          });
        }
        videoRef.current.srcObject = null;
      }
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      } catch {}
    }

    setCameraActive(false);
    isProcessingFrameRef.current = false;
  }, []);

  // WebRTC Start Camera with focus & environment facing
  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (activeTabRef.current !== 'camera') {
      return;
    }

    stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser Anda tidak mendukung akses WebRTC kamera.');
      return;
    }

    const requestId = ++cameraRequestIdRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      });

      activeStreamsRef.current.add(stream);

      if (requestId !== cameraRequestIdRef.current || activeTabRef.current !== 'camera') {
        stream.getTracks().forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch {}
        });
        activeStreamsRef.current.delete(stream);
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {}
        setCameraActive(true);
      }
    } catch (err: unknown) {
      const error = err as { name?: string };
      console.warn('Camera access denied or unavailable:', error);
      setCameraActive(false);
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraError('Izin kamera ditolak. Silakan aktifkan izin akses kamera pada browser Anda.');
      } else {
        setCameraError('Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.');
      }
    }
  }, [stopCamera]);

  // Tab change handler
  const handleTabChange = (tab: 'camera' | 'photo') => {
    activeTabRef.current = tab;
    setActiveTab(tab);

    if (tab === 'camera') {
      setSelectedPhotoPreview(null);
      setSelectedPhotoFile(null);
    } else {
      stopCamera();
    }
  };

  // Lifecycle control
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  // Guaranteed hardware release on window unload
  useEffect(() => {
    const handleUnload = () => {
      stopCamera();
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      stopCamera();
    };
  }, [stopCamera]);

  // Capture optimized image frame natively from <video> using HTML5 <canvas>
  // Proportional resize prevents network bloat and speeds up OpenCV processing
  const captureOptimizedFrameBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || videoRef.current.videoWidth === 0) {
        return resolve(null);
      }

      const video = videoRef.current;
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      // Scale to max 720px dimension to ensure quick transmission and high contrast
      const maxDim = 720;
      let targetW = vWidth;
      let targetH = vHeight;

      if (vWidth > maxDim || vHeight > maxDim) {
        if (vWidth >= vHeight) {
          targetW = maxDim;
          targetH = Math.round((vHeight / vWidth) * maxDim);
        } else {
          targetH = maxDim;
          targetW = Math.round((vWidth / vHeight) * maxDim);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Draw native video frame onto canvas
      ctx.drawImage(video, 0, 0, targetW, targetH);

      // Convert frame directly to JPEG Blob
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.86
      );
    });
  };

  // Continuous auto-scan frame processing tick
  const processScanTick = useCallback(async () => {
    // Check prerequisites
    if (
      activeTabRef.current !== 'camera' ||
      !cameraActive ||
      isAutoScanPausedRef.current ||
      isProcessingFrameRef.current
    ) {
      return;
    }

    // Capture frame natively without any third party libraries
    isProcessingFrameRef.current = true;
    const blob = await captureOptimizedFrameBlob();

    if (!blob) {
      isProcessingFrameRef.current = false;
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', blob, 'stream_frame.jpg');
      formData.append('profile', selectedProfile);
      formData.append('mode', 'fast');

      const startTime = performance.now();
      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      const elapsed = Math.round(performance.now() - startTime);
      setFpsIndicator(`${elapsed} ms`);

      if (res.ok) {
        const data: ScanApiResponse = await res.json();

        // 1. Barcode recognized and product found
        if (data.success && data.product && data.barcode) {
          const now = Date.now();
          // Debounce: don't spam the same barcode if scanned within last 3.5 seconds
          if (
            lastScannedBarcodeRef.current === data.barcode &&
            now - lastScannedTimeRef.current < 3500
          ) {
            isProcessingFrameRef.current = false;
            return;
          }

          lastScannedBarcodeRef.current = data.barcode;
          lastScannedTimeRef.current = now;
          setLastDetectedBarcode(data.barcode);

          // Audio & visual feedback
          playBeepSound();
          setScanSuccessFlash(true);
          setTimeout(() => setScanSuccessFlash(false), 800);

          if (onScanSuccess) {
            onScanSuccess(data);
          }
        }
        // 2. Barcode recognized but not found in DB / OFF
        else if (data.notFound && data.barcode) {
          const now = Date.now();
          if (
            lastScannedBarcodeRef.current === data.barcode &&
            now - lastScannedTimeRef.current < 3500
          ) {
            isProcessingFrameRef.current = false;
            return;
          }

          lastScannedBarcodeRef.current = data.barcode;
          lastScannedTimeRef.current = now;
          setLastDetectedBarcode(data.barcode);

          playBeepSound();
          setScanSuccessFlash(true);
          setTimeout(() => setScanSuccessFlash(false), 800);

          if (onBarcodeNotFound) {
            onBarcodeNotFound(data.barcode);
          }
        }
      }
    } catch {
      // Non-blocking for continuous loop; next frame will continue
    } finally {
      isProcessingFrameRef.current = false;
    }
  }, [cameraActive, selectedProfile, onScanSuccess, onBarcodeNotFound]);

  // Set up continuous scan timer loop (every 320ms for smooth non-blocking scanning)
  useEffect(() => {
    if (activeTab === 'camera' && cameraActive && !isAutoScanPaused) {
      autoScanTimerRef.current = setInterval(() => {
        processScanTick();
      }, 320);
    } else {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
        autoScanTimerRef.current = null;
      }
    }

    return () => {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
        autoScanTimerRef.current = null;
      }
    };
  }, [activeTab, cameraActive, isAutoScanPaused, processScanTick]);

  // Manual Shutter button (deep OCR scan) for hard-to-read barcodes
  const handleManualDeepScan = async () => {
    if (!videoRef.current) return;
    const blob = await captureOptimizedFrameBlob();
    if (blob) {
      const file = new File([blob], `deep_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onScanImage(file, 'deep');
    } else {
      onTriggerScanMock?.();
    }
  };

  // Handle Photo selection from File Input
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhotoPreview(url);
      setSelectedPhotoFile(file);
      onScanImage(file, 'deep');
    }
  };

  return (
    <section className="w-full lg:w-[420px] shrink-0 flex flex-col gap-3.5">
      {/* Realtime Live Status Banner */}
      <div
        className={`w-full brutal-border brutal-shadow rounded-xl py-2.5 px-4 flex items-center justify-between gap-2.5 transition-colors duration-300 ${
          scanSuccessFlash
            ? 'bg-[#00D084]'
            : isAutoScanPaused
            ? 'bg-amber-100'
            : 'bg-[#FFD027]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeTab === 'camera' && (
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isAutoScanPaused ? 'bg-amber-600' : 'bg-red-600 animate-ping'
              }`}
            />
          )}
          <span className="font-black text-xs sm:text-sm tracking-tight text-black truncate">
            {activeTab === 'camera'
              ? scanSuccessFlash
                ? `✓ BARCODE TERDETEKSI: ${lastDetectedBarcode || ''}`
                : isAutoScanPaused
                ? 'PEMINDAIAN OTOMATIS DIJEDA'
                : 'PEMINDAIAN OTOMATIS AKTIF'
              : selectedPhotoPreview
              ? 'FOTO DIPILIH DARI GALERI'
              : 'PILIH FOTO BARCODE DARI GALERI'}
          </span>
        </div>

        {activeTab === 'camera' && cameraActive && (
          <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
            {isAutoScanPaused ? 'PAUSED' : fpsIndicator}
          </span>
        )}
      </div>

      {/* Scanner Box / Viewfinder Container */}
      <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-3 flex flex-col gap-2.5">
        {/* Viewfinder Top Bar / Mode Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 1. Camera Tab */}
            <button
              type="button"
              title="Mode Pemindaian Kamera Otomatis"
              onClick={() => handleTabChange('camera')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'camera' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
              } brutal-border-sm brutal-shadow-sm flex items-center gap-1.5 text-xs font-black uppercase text-black brutal-btn cursor-pointer`}
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>Kamera</span>
            </button>

            {/* 2. Photo / Gallery Tab */}
            <button
              type="button"
              title="Unggah Foto dari Galeri"
              onClick={() => handleTabChange('photo')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'photo' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
              } brutal-border-sm brutal-shadow-sm flex items-center gap-1.5 text-xs font-black uppercase text-black brutal-btn cursor-pointer`}
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Galeri</span>
            </button>
          </div>

          {/* Pause / Resume Auto-Scan Toggle (Only on Camera tab) */}
          {activeTab === 'camera' && cameraActive && (
            <button
              type="button"
              onClick={() => setIsAutoScanPaused((prev) => !prev)}
              title={isAutoScanPaused ? 'Lanjutkan Auto-Scan' : 'Jeda Auto-Scan'}
              className="bg-gray-100 hover:bg-gray-200 brutal-border-sm rounded-lg px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1 text-black cursor-pointer"
            >
              {isAutoScanPaused ? (
                <>
                  <span>▶</span> Lanjut
                </>
              ) : (
                <>
                  <span>⏸</span> Jeda
                </>
              )}
            </button>
          )}

          {/* Hidden File Input for Photo tab */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Viewfinder Screen Container */}
        <div
          className={`relative w-full aspect-[4/5] bg-black brutal-border rounded-xl overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
            scanSuccessFlash ? 'ring-4 ring-[#00D084]' : ''
          }`}
        >
          {/* Always Keep Video Element in DOM for WebRTC streaming */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${
              activeTab === 'camera' && cameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Scanning Laser Line Animation */}
          {activeTab === 'camera' && cameraActive && !isAutoScanPaused && (
            <div className="scanner-laser pointer-events-none" />
          )}

          {/* Flash Effect on Detection */}
          {scanSuccessFlash && (
            <div className="absolute inset-0 bg-[#00D084]/25 z-20 pointer-events-none animate-pulse" />
          )}

          {/* ============================================================== */}
          {/* TAB 1: CAMERA OVERLAYS                                         */}
          {/* ============================================================== */}
          {activeTab === 'camera' && (
            <>
              {!cameraActive ? (
                /* Camera Inactive / Error Fallback */
                <div className="w-full h-full bg-[#171514] flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 text-2xl">
                    📷
                  </div>
                  <p className="text-xs font-bold leading-relaxed mb-3">
                    {cameraError || 'Membuka kamera untuk pemindaian otomatis...'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-[#00D084] brutal-border-sm brutal-shadow-sm px-4 py-1.5 rounded-lg text-xs font-black text-black uppercase brutal-btn cursor-pointer"
                  >
                    Buka Kamera
                  </button>
                </div>
              ) : (
                /* Active Viewfinder Overlays */
                <>
                  {/* Center Guidance Box */}
                  <div className="absolute inset-10 sm:inset-12 border-2 border-dashed border-white/60 rounded-xl pointer-events-none z-10 flex flex-col items-center justify-between p-2">
                    <span className="text-[10px] font-black tracking-wider uppercase bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                      {isAutoScanPaused ? 'PEMINDAIAN DIJEDA' : 'DEKATKAN BARCODE KE AREA INI'}
                    </span>
                    <span className="text-[9px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded">
                      Fokus otomatis tanpa perlu memencet tombol
                    </span>
                  </div>

                  {/* Corner Brackets Overlay */}
                  <div className="absolute inset-4 pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg shadow-sm"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg shadow-sm"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg shadow-sm"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg shadow-sm"></div>
                  </div>

                  {/* Bottom Controls Over Viewfinder */}
                  <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2">
                    {/* Deep Scan Fallback Button */}
                    <button
                      type="button"
                      title="Pindai Mendalam / Jepret Manual (Deep OCR Scan)"
                      disabled={isScanning}
                      onClick={handleManualDeepScan}
                      className="bg-white/90 hover:bg-white text-black brutal-border-sm brutal-shadow-sm px-3 py-1.5 rounded-xl font-black text-[11px] uppercase flex items-center gap-1.5 backdrop-blur-sm brutal-btn cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <span>Deep Scan</span>
                    </button>

                    {/* Restart / Re-focus Camera Button */}
                    <button
                      type="button"
                      title="Mulai Ulang Kamera"
                      onClick={startCamera}
                      className="bg-black/80 hover:bg-black text-white brutal-border-sm px-2.5 py-1.5 rounded-xl font-black text-[11px] uppercase flex items-center gap-1 backdrop-blur-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <span>Reset</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PHOTO / GALLERY STATE VIEWS                             */}
          {/* ============================================================== */}
          {activeTab === 'photo' && (
            <>
              {selectedPhotoPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Klik untuk mengganti foto"
                  className="w-full h-full bg-black flex items-center justify-center p-2 cursor-pointer group relative"
                >
                  <img
                    src={selectedPhotoPreview}
                    alt="Pratinjau Foto Barcode"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-black font-black text-xs px-3 py-1.5 rounded-lg brutal-border-sm">
                      Ganti Foto
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-20 h-20 rounded-2xl bg-[#E6F1EA] brutal-border brutal-shadow flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span className="font-black text-sm uppercase tracking-wider text-black mb-1">
                    PILIH FOTO DARI GALERI
                  </span>
                  <p className="text-[11px] font-semibold text-gray-500 max-w-[220px]">
                    Tekan di sini untuk memilih foto barcode kemasan dari penyimpanan perangkat Anda
                  </p>
                </div>
              )}

              {/* Photo Tab Action Button */}
              <button
                type="button"
                title={selectedPhotoFile ? 'Pindai Ulang Foto Terpilih' : 'Pilih Foto dari Galeri'}
                disabled={isScanning}
                onClick={() => {
                  if (selectedPhotoFile) {
                    onScanImage(selectedPhotoFile, 'deep');
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-xl bg-[#00D084] brutal-border-sm brutal-shadow flex items-center justify-center brutal-btn cursor-pointer ${
                  isScanning ? 'opacity-70 animate-pulse' : ''
                }`}
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Button (Below Scanner Card) */}
      <button
        type="button"
        onClick={onOpenReport}
        className="w-full bg-white brutal-border brutal-shadow rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 brutal-btn cursor-pointer"
      >
        <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        <span className="font-black text-xs tracking-wider uppercase text-black">
          PRODUK TIDAK SESUAI? LAPORKAN PADA KAMI!
        </span>
      </button>
    </section>
  );
}
