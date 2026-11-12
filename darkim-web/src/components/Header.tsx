import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full max-w-7xl mx-auto mb-6">
      <div className="inline-block">
        {/* Logo DARKIM */}
        <Link
          href="/"
          className="bg-white brutal-border brutal-shadow rounded-xl px-4 py-2 inline-flex items-center gap-1 hover:-translate-y-0.5 transition-transform cursor-pointer"
          title="DARKIM Beranda"
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-black">DARK</span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#00D084] relative">
            IM
            <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#00D084] rounded-full"></span>
          </span>
        </Link>

        {/* Sub Banner */}
        <div className="mt-2.5">
          <div className="bg-white brutal-border-sm brutal-shadow-sm rounded-md px-3.5 py-1.5 inline-block">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black">
              LIHAT INFORMASI MAKANAN DAN MINUMAN SEBELUM KONSUMSI
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

