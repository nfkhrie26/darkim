'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface CameraScannerProps {
  onScanImage: (file: File) => void;
  onTriggerScanMock?: () => void;
  onOpenReport: () => void;
  isScanning?: boolean;
}

export default function CameraScanner({
  onScanImage,
  onTriggerScanMock,
  onOpenReport,
  isScanning = false,
}: CameraScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'photo'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Synchronous ref to prevent WebRTC getUserMedia race conditions
  const activeTabRef = useRef<'camera' | 'photo'>('camera');
  // Generation counter to cancel in-flight getUserMedia promises
  const cameraRequestIdRef = useRef<number>(0);
  // Registry of all opened MediaStreams to prevent hardware resource leaks
  const activeStreamsRef = useRef<Set<MediaStream>>(new Set());

  // Captured snapshot state from camera shutter
  const [capturedCameraSnapshot, setCapturedCameraSnapshot] = useState<string | null>(null);

  // Uploaded photo state from gallery tab
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep activeTabRef in sync
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 100% Bulletproof Camera Hardware Release
  const stopCamera = useCallback(() => {
    // 1. Invalidate any in-flight getUserMedia promises immediately
    cameraRequestIdRef.current++;

    // 2. Stop and clear all tracked streams in activeStreamsRef
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

    // 3. Stop all tracks in streamRef
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

    // 4. Detach and release video element source
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
  }, []);

  // Start WebRTC live camera
  const startCamera = useCallback(async () => {
    setCameraError(null);

    // Guard: Do NOT start camera if user is not on camera tab
    if (activeTabRef.current !== 'camera') {
      return;
    }

    // Stop any existing stream first
    stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser tidak mendukung akses kamera langsung.');
      return;
    }

    // Unique ID for this specific start request
    const requestId = ++cameraRequestIdRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // Register stream immediately into tracker
      activeStreamsRef.current.add(stream);

      // CRITICAL RACE CONDITION & CANCEL CHECK:
      // If user switched away, pressed shutter, or unmounted while getUserMedia was resolving:
      if (
        requestId !== cameraRequestIdRef.current ||
        activeTabRef.current !== 'camera'
      ) {
        // Immediately terminate this stream and turn off hardware LED
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
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera ditolak. Silakan izinkan akses kamera di browser Anda.');
      } else {
        setCameraError('Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.');
      }
    }
  }, [stopCamera]);

  // Manage camera lifecycle based on activeTab & captured status
  useEffect(() => {
    if (activeTab === 'camera') {
      if (!capturedCameraSnapshot) {
        startCamera();
      }
    } else {
      // Switched to photo tab -> immediately shut off camera hardware
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, capturedCameraSnapshot, startCamera, stopCamera]);

  // Window unload / pagehide listener for guaranteed hardware release
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

  // Tab switcher
  const handleTabChange = (tab: 'camera' | 'photo') => {
    activeTabRef.current = tab;
    setActiveTab(tab);

    if (tab === 'camera') {
      setSelectedPhotoPreview(null);
      setSelectedPhotoFile(null);
      // startCamera will be cleanly invoked by useEffect
    } else {
      // When switching to photo, immediately shut off browser camera hardware
      stopCamera();
    }
  };

  // Capture frame from live video camera
  const captureFrameFromVideo = () => {
    if (!videoRef.current) return null;
    const width = videoRef.current.videoWidth > 0 ? videoRef.current.videoWidth : 640;
    const height = videoRef.current.videoHeight > 0 ? videoRef.current.videoHeight : 480;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return { canvas, dataUrl };
  };

  // Shutter button action on camera tab
  const handleCameraCapture = () => {
    if (cameraActive && videoRef.current) {
      const captured = captureFrameFromVideo();
      if (captured) {
        // 1. Show captured snapshot on card
        setCapturedCameraSnapshot(captured.dataUrl);

        // 2. Shut off camera hardware while viewing snapshot
        stopCamera();

        // 3. Convert to File and forward to ML / scan
        captured.canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onScanImage(file);
          }
        }, 'image/jpeg');
      }
    } else {
      onTriggerScanMock?.();
    }
  };

  // Restart camera action after capturing photo
  const handleRestartCamera = () => {
    setCapturedCameraSnapshot(null);
    // startCamera will be automatically triggered by useEffect
  };

  // Handle Photo selection from File Input
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhotoPreview(url);
      setSelectedPhotoFile(file);
      onScanImage(file);
    }
  };

  return (
    <section className="w-full lg:w-[420px] shrink-0 flex flex-col gap-3.5">
      {/* Yellow Guide Banner */}
      <div className="w-full bg-[#FFD027] brutal-border brutal-shadow rounded-xl py-2.5 px-4 flex items-center justify-center gap-2.5">
        <svg className="w-6 h-6 text-black shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="5" width="2" height="14" />
          <rect x="5" y="5" width="1" height="14" />
          <rect x="7" y="5" width="3" height="14" />
          <rect x="12" y="5" width="1.5" height="14" />
          <rect x="15" y="5" width="2" height="14" />
          <rect x="18" y="5" width="1" height="14" />
          <rect x="20" y="5" width="2" height="14" />
        </svg>
        <span className="font-black text-xs sm:text-sm tracking-tight text-black">
          {activeTab === 'camera'
            ? capturedCameraSnapshot
              ? 'foto berhasil diambil. periksa hasil gizi'
              : 'arahkan kamera anda pada barcode'
            : selectedPhotoPreview
            ? 'foto terpilih dari galeri'
            : 'pilih foto barcode dari galeri'}
        </span>
      </div>

      {/* Scanner Box / Container Card */}
      <div className="w-full bg-white brutal-border brutal-shadow rounded-2xl p-3 flex flex-col gap-2.5">
        {/* Viewfinder Top Bar / Tabs */}
        <div className="flex items-center gap-2">
          {/* 1. Camera Tab */}
          <button
            type="button"
            title="Mode Kamera Langsung"
            onClick={() => handleTabChange('camera')}
            className={`w-9 h-9 rounded-lg ${
              activeTab === 'camera' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
            } brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer`}
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </button>

          {/* 2. Photo / Gallery Tab */}
          <button
            type="button"
            title="Unggah Foto dari Galeri"
            onClick={() => handleTabChange('photo')}
            className={`w-9 h-9 rounded-lg ${
              activeTab === 'photo' ? 'bg-[#00D084]' : 'bg-white hover:bg-gray-50'
            } brutal-border-sm brutal-shadow-sm flex items-center justify-center brutal-btn cursor-pointer`}
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

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
        <div className="relative w-full aspect-[4/5] bg-black brutal-border rounded-xl overflow-hidden flex items-center justify-center select-none">
          {/* Always Keep Video Element in DOM to ensure clean WebRTC cleanup */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${
              activeTab === 'camera' && cameraActive && !capturedCameraSnapshot ? 'block' : 'hidden'
            }`}
          />

          {/* Laser Line Animation when live camera is running */}
          {activeTab === 'camera' && cameraActive && !capturedCameraSnapshot && (
            <div className="scanner-laser" />
          )}

          {/* ============================================================== */}
          {/* TAB 1: CAMERA STATE VIEWS                                      */}
          {/* ============================================================== */}
          {activeTab === 'camera' && (
            <>
              {/* If snapshot is captured -> display snapshot image + Restart button */}
              {capturedCameraSnapshot ? (
                <div className="w-full h-full bg-black flex items-center justify-center p-2 relative">
                  <img
                    src={capturedCameraSnapshot}
                    alt="Hasil Foto Kamera"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />

                  {/* Top-Right Restart / Foto Ulang Button */}
                  <button
                    type="button"
                    onClick={handleRestartCamera}
                    title="Ambil Foto Ulang"
                    className="absolute top-3 right-3 bg-white hover:bg-gray-100 brutal-border-sm brutal-shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-black uppercase text-black brutal-btn cursor-pointer z-30"
                  >
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Foto Ulang</span>
                  </button>
                </div>
              ) : !cameraActive ? (
                /* Fallback view when camera is blocked or starting */
                <div className="w-full h-full bg-[#171514] flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 text-2xl">
                    📷
                  </div>
                  <p className="text-xs font-bold leading-relaxed mb-3">
                    {cameraError || 'Membuka kamera langsung... Pastikan izin kamera aktif pada browser Anda.'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-[#00D084] brutal-border-sm brutal-shadow-sm px-4 py-1.5 rounded-lg text-xs font-black text-black uppercase brutal-btn cursor-pointer"
                  >
                    Coba Buka Kamera
                  </button>
                </div>
              ) : null}
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PHOTO / GALLERY STATE VIEWS                             */}
          {/* ============================================================== */}
          {activeTab === 'photo' && (
            <>
              {selectedPhotoPreview ? (
                /* If a photo has been selected -> display image preview */
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
                  {/* Hover indicator to change photo */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-black font-black text-xs px-3 py-1.5 rounded-lg brutal-border-sm">
                      Ganti Foto
                    </span>
                  </div>
                </div>
              ) : (
                /* Photo Placeholder Logo Box (Clickable to open file picker) */
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
                    PILIH FOTO BARCODE
                  </span>
                  <p className="text-[11px] font-semibold text-gray-500 max-w-[220px]">
                    Tekan di sini untuk memilih foto kemasan pangan dari galeri perangkat Anda
                  </p>
                </div>
              )}
            </>
          )}

          {/* Outer Viewfinder Corner Brackets Overlay */}
          <div className="absolute inset-4 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-black rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-black rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-black rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-black rounded-br-lg"></div>
          </div>

          {/* Floating Action Button at Bottom */}
          {activeTab === 'camera' ? (
            capturedCameraSnapshot ? (
              /* If photo is already captured -> shutter shows Restart / Foto Ulang */
              <button
                type="button"
                title="Foto Ulang Kamera"
                onClick={handleRestartCamera}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-[#FFD027] brutal-border-sm brutal-shadow flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-black brutal-btn cursor-pointer"
              >
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>FOTO ULANG</span>
              </button>
            ) : (
              /* Live Camera Capture Shutter Button */
              <button
                type="button"
                title="Ambil Foto Barcode Sekarang"
                disabled={isScanning}
                onClick={handleCameraCapture}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-xl bg-[#00D084] brutal-border-sm brutal-shadow flex items-center justify-center brutal-btn cursor-pointer ${
                  isScanning ? 'opacity-70 animate-pulse' : ''
                }`}
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
            )
          ) : (
            /* Photo Tab Button */
            <button
              type="button"
              title={selectedPhotoFile ? 'Pindai Ulang Foto Terpilih' : 'Pilih Foto dari Galeri'}
              disabled={isScanning}
              onClick={() => {
                if (selectedPhotoFile) {
                  onScanImage(selectedPhotoFile);
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
