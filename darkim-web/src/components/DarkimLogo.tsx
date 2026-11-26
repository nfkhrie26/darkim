import Link from 'next/link';

interface DarkimLogoProps {
  title?: string;
}

/**
 * Reusable Neo-Brutalist DARKIM brand logo pill.
 */
export default function DarkimLogo({ title = 'DARKIM Beranda' }: DarkimLogoProps) {
  return (
    <Link
      href="/"
      className="bg-white brutal-border brutal-shadow rounded-xl px-4 h-12 inline-flex items-center gap-1 hover:-translate-y-0.5 transition-transform cursor-pointer"
      title={title}
    >
      <span className="text-2xl sm:text-3xl font-black tracking-tight text-black leading-none">DARK</span>
      <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#00D084] relative leading-none">
        IM
        <span className="absolute -bottom-0.5 left-0 right-0 h-1 bg-[#00D084] rounded-full"></span>
      </span>
    </Link>
  );
}
