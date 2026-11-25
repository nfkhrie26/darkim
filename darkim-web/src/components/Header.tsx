import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full max-w-7xl mx-auto mb-4">
      <Link
        href="/"
        className="bg-white brutal-border brutal-shadow rounded-xl px-4 py-2 inline-flex items-center gap-1 hover:-translate-y-0.5 transition-transform cursor-pointer"
        title="DARKIM Beranda"
      >
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-black">DARK</span>
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#00D084] relative">
          IM
          <span className="absolute -bottom-0.5 left-0 right-0 h-1 bg-[#00D084] rounded-full"></span>
        </span>
      </Link>
    </header>
  );
}

