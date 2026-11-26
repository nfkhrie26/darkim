'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkimLogo from '@/components/DarkimLogo';
import { Icons } from '@/components/ui/Icons';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Scan Barcode',
    title: 'Halaman Pindai Barcode',
    Icon: Icons.Barcode,
    isActive: (pathname: string) => pathname === '/',
  },
  {
    href: '/katalog',
    label: 'Katalog',
    title: 'Katalog Produk',
    Icon: Icons.Search,
    isActive: (pathname: string) => pathname === '/katalog' || pathname.startsWith('/produk/'),
  },
] as const;

function NavLinks({ pathname, isMobile = false }: { pathname: string; isMobile?: boolean }) {
  return (
    <>
      {NAV_ITEMS.map(({ href, label, title, Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            title={title}
            className={`${
              isMobile ? 'py-2.5 px-3 justify-center' : 'px-4 py-2'
            } rounded-xl inline-flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              active
                ? 'bg-[#00D084] text-black brutal-border-sm brutal-shadow-sm'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4 text-black shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Sticky Floating Top Bar: Logo DARKIM (Left) + Centered 2-Tab Floating Navbar (Desktop) */}
      <header className="sticky top-3 sm:top-4 z-40 w-full max-w-7xl mx-auto mb-5 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-4 pointer-events-none">
        <div className="pointer-events-auto justify-self-start shrink-0">
          <DarkimLogo />
        </div>

        {/* Desktop Floating Top Navbar (Centered, 2 Tabs: Icon + Label) */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-1.5 bg-white brutal-border brutal-shadow rounded-2xl p-1.5 pointer-events-auto justify-self-center"
        >
          <NavLinks pathname={pathname} />
        </nav>

        {/* Right Grid Spacer for True Centering on Desktop */}
        <div className="hidden md:block" aria-hidden="true" />
      </header>

      {/* Mobile Floating Bottom Bar (Centered Bottom, 2 Tabs: Icon + Label) */}
      <nav
        aria-label="Navigasi Mobile"
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm bg-white brutal-border brutal-shadow rounded-2xl p-1.5 grid grid-cols-2 gap-1.5"
      >
        <NavLinks pathname={pathname} isMobile />
      </nav>
    </>
  );
}
