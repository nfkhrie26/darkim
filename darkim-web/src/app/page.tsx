'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import CameraScanner from '@/components/scanner/CameraScanner';
import ScanResultView from '@/components/scanner/ScanResultView';
import ReportTextModal from '@/components/modals/ReportTextModal';
import ContributePhotoModal from '@/components/modals/ContributePhotoModal';
import { HealthProfile, NutritionEvaluation, ProductModel, ScanApiResponse } from '@/types';

export default function HomeScannerPage() {
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile>('diabetes');
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

  // Initial load: Biarkan kosong menunggu pemindaian pertama dari kamera / foto pengguna
  useEffect(() => {
    // Tidak lagi me-load dummy produk otomatis agar tidak membingungkan pengguna
  }, []);

  // Handle image upload or camera capture
  const handleScanImage = async (file: File) => {
    // Backup current data before starting new scan
    if (product && evaluation) {
      setPreviousProduct(product);
      setPreviousEvaluation(evaluation);
    }

    setScanError(null);
    setIsScanning(true);
    showToast('Mengirim gambar ke AI Vision Engine...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profile', selectedProfile);

      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      const data: ScanApiResponse = await res.json();

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
        // Prompt user to contribute or report
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
    showToast('Memindai barcode...');

    // Pick next barcode
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

  const handleToggleTableMode = () => {
    const next = tableMode === 'status' ? 'nutrition' : 'status';
    setTableMode(next);
    showToast(`Beralih ke: ${next === 'status' ? 'Status Zat Gizi' : 'Informasi Nilai Gizi'}`);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Top Header & Branding */}
      <Header />

      {/* Main Content Area (1:1 Parity with Blade Layout) */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        {/* Left Vertical Floating Sidebar */}
        <Sidebar onToggleTableMode={handleToggleTableMode} onShowToast={showToast} />

        {/* Center Column: Barcode Scanner Viewfinder */}
        <CameraScanner
          onScanImage={handleScanImage}
          onTriggerScanMock={handleTriggerScanMock}
          onOpenReport={() => {
            setFallbackBarcode(product?.barcode || '');
            setReportModalOpen(true);
          }}
          isScanning={isScanning}
        />

        {/* Right Column: Product Details & Nutritional Value Analysis */}
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
        />
      </main>

      {/* Modals & Overlays */}
      <ReportTextModal
        isOpen={reportModalOpen}
        barcode={fallbackBarcode}
        onClose={() => setReportModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <ContributePhotoModal
        isOpen={contributeModalOpen}
        barcode={fallbackBarcode}
        onClose={() => setContributeModalOpen(false)}
        onSubmitSuccess={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

