'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DarkimLogo from '@/components/DarkimLogo';
import { Icons } from '@/components/ui/Icons';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/tickets');
      } else {
        setError(data.message || 'Login gagal.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 bg-[#E6F1EA]">
      {/* Always Floating Branding Logo */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-8 z-40">
        <DarkimLogo />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl sm:text-2xl font-black text-black">Login Administrator</h1>
          <span className="bg-[#FFD027] brutal-border-sm brutal-shadow-sm px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-black">
            Admin Area
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-600 mb-6 leading-relaxed">
          Akses area verifikasi tiket laporan barcode dan sinkronisasi data gizi ke Open Food Facts.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-red-100 brutal-border-sm brutal-shadow-sm rounded-xl text-xs font-bold text-red-900 flex items-center gap-2 animate-in fade-in">
            <Icons.Alert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full bg-white brutal-border-sm rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white brutal-border-sm rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00D084] brutal-border brutal-shadow rounded-xl py-3 font-black text-xs sm:text-sm uppercase tracking-wider text-black brutal-btn cursor-pointer mt-2 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icons.Refresh className="w-4 h-4 animate-spin text-black" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>

          <div className="text-center mt-3 pt-3 border-t-2 border-black/10">
            <Link
              href="/"
              className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5 text-black" />
              <span>Kembali ke Beranda Aplikasi</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
