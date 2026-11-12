'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TicketModel } from '@/types';
import TicketDetailModal from '@/components/admin/TicketDetailModal';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [selectedTicket, setSelectedTicket] = useState<TicketModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/api/tickets' : `/api/tickets?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Failed fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Admin Navbar */}
      <header className="w-full max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-white brutal-border brutal-shadow rounded-xl px-4 py-2 inline-flex items-center gap-1">
            <span className="text-2xl font-black text-black">DARK</span>
            <span className="text-2xl font-black text-[#00D084]">IM</span>
          </Link>
          <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-1 rounded-lg text-xs font-black uppercase text-black">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/tickets"
            className="bg-[#00D084] brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-black brutal-btn"
          >
            Tiket Laporan
          </Link>
          <Link
            href="/admin/products"
            className="bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-black brutal-btn hover:bg-gray-50"
          >
            Database Produk
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white brutal-border-sm brutal-shadow-sm rounded-xl px-4 py-2 text-xs font-black uppercase text-red-600 brutal-btn hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        {/* Title & Tabs */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black">Dashboard Tiket Laporan User</h1>
            <p className="text-xs font-semibold text-gray-500">
              Kelola barcode yang belum terdaftar dan selesaikan data gizinya via OpenFoodFacts atau Input Manual.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'RESOLVED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase brutal-border-sm brutal-shadow-sm brutal-btn cursor-pointer ${
                  filter === status ? 'bg-[#FFD027] text-black' : 'bg-white text-black'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table Card */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-4 sm:p-5 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-gray-500">Memuat tiket...</div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-black text-black">Tidak ada tiket dengan status {filter}.</p>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Tiket baru akan otomatis muncul saat pengguna melaporkan produk atau mengunggah foto kemasan.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b-2 border-black text-xs font-black uppercase text-black bg-gray-100">
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3">Catatan / Nama</th>
                  <th className="py-2.5 px-3 text-center">Foto Terlampir</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Tanggal</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 text-xs">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-black">{t.barcode}</td>
                    <td className="py-3 px-3 font-medium text-gray-800 max-w-xs truncate">
                      {t.description || <span className="text-gray-400 italic">(Tanpa catatan)</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {t.frontPhoto ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            Depan ✓
                          </span>
                        ) : null}
                        {t.nutritionPhoto ? (
                          <span className="bg-blue-100 text-blue-800 border border-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            Gizi ✓
                          </span>
                        ) : null}
                        {!t.frontPhoto && !t.nutritionPhoto && (
                          <span className="text-gray-400 text-[10px] font-semibold">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase brutal-border-sm ${
                          t.status === 'PENDING'
                            ? 'bg-[#FFD027] text-black'
                            : t.status === 'RESOLVED'
                            ? 'bg-[#00D084] text-black'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-gray-500 font-medium">
                      {new Date(t.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsModalOpen(true);
                        }}
                        className="bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider brutal-btn cursor-pointer"
                      >
                        {t.status === 'PENDING' ? 'Eksekusi Tiket' : 'Lihat Detail'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Ticket Detail & Resolution Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        onResolved={fetchTickets}
      />
    </div>
  );
}

