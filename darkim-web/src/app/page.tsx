import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import LandingFooter from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'DARKIM - Evaluasi Nilai Gizi Makanan & Minuman Kemasan',
  description:
    'Sistem pendukung keputusan evaluasi nilai gizi pangan untuk profil Hipertensi dan Diabetes Melitus berbasis standar BPOM dan Open Food Facts.',
};

export default function LandingHomePage() {
  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 pb-12 md:pb-8 bg-[#E6F1EA]">
      {/* Main Landing Page Content (No Top/Bottom Nav on Landing Page) */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. About Section */}
        <AboutSection />

        {/* 3. Fitur Aplikasi */}
        <FeaturesSection />

        {/* 4. Footer */}
        <LandingFooter />
      </main>
    </div>
  );
}
