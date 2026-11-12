'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Branding */}
      <Link href="/" className="bg-white brutal-border brutal-shadow rounded-2xl px-5 py-2.5 inline-flex items-center gap-1 mb-6">
        <span className="text-3xl font-black text-black">DARK</span>
        <span className="text-3xl font-black text-[#00D084] relative">
          IM
          <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#00D084] rounded-full"></span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-white brutal-border brutal-shadow rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-black text-black mb-1">Login Administrator</h1>
        <p className="text-xs font-semibold text-gray-500 mb-6">
          Akses area pengelolaan tiket verifikasi dan database produk DARKIM.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 brutal-border-sm rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-black uppercase text-black block mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full brutal-border-sm rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-black block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full brutal-border-sm rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00D084] brutal-border brutal-shadow rounded-xl py-3 font-black text-xs sm:text-sm uppercase tracking-wider text-black brutal-btn cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'MASUK KE DASHBOARD'}
          </button>

          <div className="text-center mt-3">
            <span className="text-[11px] text-gray-500 font-semibold">
              Kredensial Default Seed: <code className="bg-yellow-100 px-1 py-0.5 rounded text-black font-bold">admin / admin123</code>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

