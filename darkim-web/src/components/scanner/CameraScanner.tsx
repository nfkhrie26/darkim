'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HealthProfile, ScanApiResponse } from '@/types';
import ProfileSelector from './ProfileSelector';
import GalleryUploadView from './GalleryUploadView';
import { Icons } from '@/components/ui/Icons';
import { playBeepSound } from '@/lib/soundUtils';

interface CameraScannerProps {
  onScanImage: (file: File, mode?: 'fast' | 'deep') => void;
  onScanSuccess?: (data: ScanApiResponse) => void;
  onBarcodeNotFound?: (barcode: string) => void;
  onTriggerScanMock?: () => void;
  isScanning?: boolean;
  selectedProfile?: HealthProfile;
  onSelectProfile?: (profile: HealthProfile) => void;
  activeTab?: 'camera' | 'photo';
  onTabChange?: (tab: 'camera' | 'photo') => void;
}

export default function CameraScanner({
  onScanImage,
  onScanSuccess,
  onBarcodeNotFound,
  onTriggerScanMock,
  isScanning = false,
  selectedProfile = 'diabetes',
  onSelectProfile,
  activeTab: controlledActiveTab,
  onTabChange,
}: CameraScannerProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'camera' | 'photo'>('camera');
  const activeTab = controlledActiveTab ?? internalActiveTab;
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
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }

    if (tab === 'camera') {
      setSelectedPhotoPreview(null);
      setSelectedPhotoFile(null);
    } else {
      stopCamera();
    }
  };

  // Lifecycle control
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === 'camera') {
      setSelectedPhotoPreview(null);
      setSelectedPhotoFile(null);
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
    <section className="flex-1 w-full flex flex-col gap-3.5">
      {/* Scanner Box / Viewfinder Container */}
      <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-3.5 flex flex-col gap-3">
        {/* Viewfinder Top Bar / Mode Switcher */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Desktop Only: Camera and Gallery tabs with text */}
            <div className="hidden md:flex items-center gap-2">
              {/* 1. Camera Tab */}
              <button
                type="button"
                title="Mode Pemindaian Kamera Otomatis"
                onClick={() => handleTabChange('camera')}
                className={`px-3 py-1.5 rounded-lg ${
                  activeTab === 'camera' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
                } brutal-border-sm brutal-shadow-sm flex items-center gap-1.5 text-xs font-black uppercase text-black brutal-btn cursor-pointer`}
              >
                <Icons.Camera className="w-4 h-4 text-black" />
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
                <Icons.Gallery className="w-4 h-4 text-black" />
                <span>Galeri</span>
              </button>
            </div>

            {/* Pause / Resume Auto-Scan Toggle (Only on Camera tab) */}
            {activeTab === 'camera' && cameraActive && (
              <button
                type="button"
                onClick={() => setIsAutoScanPaused((prev) => !prev)}
                title={isAutoScanPaused ? 'Lanjutkan Auto-Scan' : 'Jeda Auto-Scan'}
                className="bg-gray-100 hover:bg-gray-200 brutal-border-sm rounded-lg px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1.5 text-black cursor-pointer"
              >
                {isAutoScanPaused ? (
                  <>
                    <Icons.Play className="w-3 h-3 text-black" />
                    <span>Lanjut</span>
                  </>
                ) : (
                  <>
                    <Icons.Pause className="w-3 h-3 text-black" />
                    <span>Jeda</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Health Profile Selector (Hipertensi / Diabetes) */}


          {/* Hidden File Input for Photo tab */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Viewfinder Screen Container (Wide on PC / Desktop) */}
        <div
          className={`relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9] max-h-[540px] bg-black brutal-border rounded-2xl overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
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
                  <div className="w-14 h-14 rounded-2xl bg-white/10 brutal-border-sm flex items-center justify-center mb-3">
                    <Icons.Camera className="w-7 h-7 text-white" />
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
                  <div className="absolute inset-x-6 sm:inset-x-auto sm:w-[480px] sm:left-1/2 sm:-translate-x-1/2 top-10 bottom-16 sm:top-12 sm:bottom-20 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none z-10 flex flex-col items-center justify-start p-3">
                    <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase bg-black/75 text-white px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                      {isAutoScanPaused ? 'PEMINDAIAN DIJEDA' : 'DEKATKAN BARCODE KE AREA INI'}
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
                    {/* Restart / Re-focus Camera Button */}
                    <button
                      type="button"
                      title="Mulai Ulang Kamera"
                      onClick={startCamera}
                      className="bg-black/80 hover:bg-black text-white brutal-border-sm px-2.5 py-1.5 rounded-xl font-black text-[11px] uppercase flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
                    >
                      <Icons.Refresh className="w-3.5 h-3.5 text-white" />
                      <span>Reset</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PHOTO / GALLERY STATE VIEWS (Modular Subcomponent)     */}
          {/* ============================================================== */}
          {activeTab === 'photo' && (
            <GalleryUploadView
              selectedPhotoPreview={selectedPhotoPreview}
              selectedPhotoFile={selectedPhotoFile}
              isScanning={isScanning}
              onTriggerFileSelect={() => fileInputRef.current?.click()}
              onScanImage={onScanImage}
            />
          )}
        </div>
      </div>
    </section>
  );
}
