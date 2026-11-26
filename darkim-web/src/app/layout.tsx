import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

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
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} min-h-screen bg-[#E6F1EA] text-black antialiased selection:bg-[#00D084] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}

