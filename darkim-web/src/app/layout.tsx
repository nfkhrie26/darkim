import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DARKIM - Pindai Barcode & Evaluasi Nilai Gizi',
  description: 'Sistem pendukung keputusan evaluasi nilai gizi pangan untuk profil Hipertensi dan Diabetes Melitus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#E6F1EA] text-black antialiased selection:bg-[#00D084] selection:text-black">
        {children}
      </body>
    </html>
  );
}

