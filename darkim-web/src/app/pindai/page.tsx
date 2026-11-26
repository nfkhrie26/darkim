'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import CameraScanner from '@/components/scanner/CameraScanner';
import ScannerMobileHeaderActions from '@/components/scanner/ScannerMobileHeaderActions';
import ScanResultView from '@/components/scanner/ScanResultView';
import ReportProductModal from '@/components/modals/ReportProductModal';
import ContributePhotoModal from '@/components/modals/ContributePhotoModal';
import { detectBarcodeInBrowser } from '@/lib/browserBarcodeDetector';
import { HealthProfile, NutritionEvaluation, ProductModel, ScanApiResponse } from '@/types';

export default function PindaiPage() {
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile>('diabetes');
  const [activeTab, setActiveTab] = useState<'camera' | 'photo'>('camera');
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [evaluation, setEvaluation] = useState<NutritionEvaluation | null>(null);
  const [tableMode, setTableMode] = useState<'status' | 'nutrition'>('status');

  // History backup for "Restore Previous"
  const [previousProduct, setPreviousProduct] = useState<ProductModel | null>(null);
  const [previousEvaluation, setPreviousEvaluation] = useState<NutritionEvaluation | null>(null);

  // Scan error state
  const [scanError, setScanError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Fallback modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [fallbackBarcode, setFallbackBarcode] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset scanner to empty state
  const handleResetScan = () => {
    setScanError(null);
    setProduct(null);
    setEvaluation(null);
    showToast('Tampilan berhasil direset.');
  };

  // Restore previous product information
  const handleRestorePrevious = () => {
    if (previousProduct && previousEvaluation) {
      setProduct(previousProduct);
      setEvaluation(previousEvaluation);
      setScanError(null);
      showToast(`Mengembalikan informasi produk: ${previousProduct.name}`);
    }
  };

  // Re-evaluate when profile changes
  const handleSelectProfile = async (newProfile: HealthProfile) => {
    if (newProfile === selectedProfile) {
      showToast(`Filter ${newProfile.toUpperCase()} sedang aktif.`);
      return;
    }
    setSelectedProfile(newProfile);
    showToast(`Beralih ke profil: ${newProfile === 'diabetes' ? 'DIABETES MELITUS' : 'HIPERTENSI'}`);

    if (product) {
      // Re-evaluate current product with new profile
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: product.barcode, profile: newProfile }),
      });
      const data: ScanApiResponse = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
      }
    }
  };

  // Real-time Continuous Auto-Scan Success handler
  const handleAutoScanSuccess = (data: ScanApiResponse) => {
    if (data.product && data.evaluation) {
      if (product && evaluation && product.barcode !== data.product.barcode) {
        setPreviousProduct(product);
        setPreviousEvaluation(evaluation);
      }
      setProduct(data.product);
      setEvaluation(data.evaluation);
      setScanError(null);
      const timing = data.time_ms ? ` (${data.time_ms} ms)` : '';
      showToast(`Produk terdeteksi: ${data.product.name}${timing}`);
    }
  };

  // Real-time Barcode Not Found handler
  const handleBarcodeNotFound = (scannedBarcode: string) => {
    setFallbackBarcode(scannedBarcode);
    showToast(`Barcode ${scannedBarcode} terdeteksi, tetapi belum terdaftar di database.`);
    setContributeModalOpen(true);
  };

  // Handle manual image upload or deep OCR scan
  const handleScanImage = async (file: File, mode: 'fast' | 'deep' = 'deep') => {
    if (product && evaluation) {
      setPreviousProduct(product);
      setPreviousEvaluation(evaluation);
    }

    setScanError(null);
    setIsScanning(true);
    showToast(mode === 'deep' ? 'Memproses Deep Scan (AI Vision + Multi-Pass OCR)...' : 'Mengirim gambar ke AI Vision Engine...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profile', selectedProfile);
      formData.append('mode', mode);

      const nativeBarcodePromise =
        mode === 'deep' ? detectBarcodeInBrowser(file) : Promise.resolve(null);

      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      let data: ScanApiResponse = await res.json();

      if (!data.success && !data.notFound) {
        const nativeBarcode = await nativeBarcodePromise;
        if (nativeBarcode) {
          const fallbackRes = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: nativeBarcode, profile: selectedProfile }),
          });
          data = await fallbackRes.json();
        }
      }

      if (data.success && data.product && data.evaluation) {
        setProduct(data.product);
        setEvaluation(data.evaluation);
        setScanError(null);
        const timing = data.time_ms ? ` (${data.time_ms} ms)` : '';
        showToast(`Produk terdeteksi: ${data.product.name}${timing}`);
      } else if (data.notFound && data.barcode) {
        setFallbackBarcode(data.barcode);
        const timing = data.time_ms ? ` (${data.time_ms} ms)` : '';
        showToast(`Barcode ${data.barcode} terdeteksi${timing}, tetapi belum terdaftar di database.`);
        setContributeModalOpen(true);
      } else {
        const errorMsg = data.message || 'Gagal mendeteksi barcode kemasan. Pastikan barcode terlihat jelas, tegak, dan fokus.';
        setScanError(errorMsg);
        showToast(errorMsg);
      }
    } catch {
      const errorMsg = 'Gagal memproses pemindaian gambar. Pastikan server AI aktif.';
      setScanError(errorMsg);
      showToast(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  // Mock Barcode Trigger / Scanner Simulation
  const mockBarcodes = [
    '8992753123456', // Ultra Milk
    '8991234567890', // Koko Krunch
    '8998866200256', // Teh Botol
    '089686010924',  // Indomie Goreng
    '7613035889981', // Bear Brand
    '8992760136012', // Oreo Vanilla
  ];

  const handleTriggerScanMock = async () => {
    setIsScanning(true);
    showToast('Memindai barcode simulasi...');

    const currentIdx = mockBarcodes.findIndex((b) => b === product?.barcode);
    const nextBarcode = mockBarcodes[(currentIdx + 1) % mockBarcodes.length];

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: nextBarcode, profile: selectedProfile }),
      });

      const data: ScanApiResponse = await res.json();
      if (data.success && data.product && data.evaluation) {
        setProduct(data.product);
        setEvaluation(data.evaluation);
        showToast(`Produk terdeteksi: ${data.product.name}`);
      }
    } catch {
      showToast('Gagal memuat produk simulasi.');
    } finally {
      setIsScanning(false);
    }
  };

  const isViewingResult = isScanning || product !== null || scanError !== null;

  const handleOpenScanner = () => {
    setProduct(null);
    setEvaluation(null);
    setScanError(null);
  };

  const handleTabChange = (tab: 'camera' | 'photo') => {
    setActiveTab(tab);
    if (isViewingResult) {
      setProduct(null);
      setEvaluation(null);
      setScanError(null);
    }
  };

  const handleToggleTableMode = () => {
    const next = tableMode === 'status' ? 'nutrition' : 'status';
    setTableMode(next);
    showToast(`Beralih ke: ${next === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'}`);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 bg-[#E6F1EA]">
      {/* Sticky Floating Header with aligned Top-Right Mobile Camera & Gallery Action Icons */}
      <Header
        rightContent={
          <ScannerMobileHeaderActions
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        }
      />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        {/* Center Column: Camera Scanner */}
        {!isViewingResult && (
          <CameraScanner
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onScanImage={handleScanImage}
            onScanSuccess={handleAutoScanSuccess}
            onBarcodeNotFound={handleBarcodeNotFound}
            onTriggerScanMock={handleTriggerScanMock}
            isScanning={isScanning}
            selectedProfile={selectedProfile}
            onSelectProfile={handleSelectProfile}
          />
        )}

        {/* Right Column: Product Details & Nutritional Value Analysis */}
        {isViewingResult && (
          <ScanResultView
            product={product}
            evaluation={evaluation}
            selectedProfile={selectedProfile}
            onSelectProfile={handleSelectProfile}
            tableMode={tableMode}
            onToggleTableMode={handleToggleTableMode}
            isScanning={isScanning}
            scanError={scanError}
            hasPreviousData={Boolean(previousProduct && previousEvaluation)}
            onReset={handleResetScan}
            onRestorePrevious={handleRestorePrevious}
            onOpenContribute={() => {
              setFallbackBarcode(product?.barcode || '');
              setContributeModalOpen(true);
            }}
            onOpenReport={() => {
              setFallbackBarcode(product?.barcode || '');
              setReportModalOpen(true);
            }}
            onOpenScanner={handleOpenScanner}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <ReportProductModal
        isOpen={reportModalOpen}
        barcode={fallbackBarcode}
        productName={product?.name}
        brand={product?.brand}
        category={product?.category}
        onClose={() => setReportModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <ContributePhotoModal
        isOpen={contributeModalOpen}
        barcode={fallbackBarcode}
        productName={product?.name}
        brand={product?.brand}
        category={product?.category}
        onClose={() => setContributeModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
