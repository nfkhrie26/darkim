'use client';

import { useState, useEffect } from 'react';
import { TicketModel } from '@/types';
import { Icons } from '@/components/ui/Icons';
import AdminHeader from '@/components/admin/AdminHeader';
import TicketTableRow from '@/components/admin/tickets/TicketTableRow';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const msg = params.get('msg');
      if (msg) {
        setNotification(msg);
        setTimeout(() => setNotification(null), 5000);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-[#E6F1EA]">
      {/* Standard Admin Navbar */}
      <AdminHeader currentTab="tickets" />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5">
        {notification && (
          <div className="bg-[#00D084]/20 brutal-border brutal-shadow-sm rounded-2xl p-4 text-xs font-black text-black flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Icons.Check className="w-4 h-4 text-black shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-black hover:text-red-600 font-black cursor-pointer ml-2"
            >
              <Icons.Close className="w-4 h-4 text-black" />
            </button>
          </div>
        )}

        {/* Title & Filter Tabs Card */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#FFD027] brutal-border-sm px-2 py-0.5 rounded text-[10px] font-black uppercase text-black">
                Crowdsourcing Queue
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black">Dashboard Tiket Laporan User</h1>
            <p className="text-xs font-semibold text-gray-600 mt-1 max-w-xl leading-relaxed">
              Kelola antrean barcode produk yang belum terdaftar. Verifikasi foto kemasan atau setujui input mandiri pengguna untuk disinkronkan ke Open Food Facts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'RESOLVED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider brutal-shadow-sm brutal-btn cursor-pointer ${
                  filter === status
                    ? 'bg-[#FFD027] text-black brutal-border'
                    : 'bg-white text-black hover:bg-gray-50 brutal-border-sm'
                }`}
              >
                {status === 'ALL' ? 'Semua' : status === 'PENDING' ? 'Pending' : 'Selesai'}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table Card */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Icons.Refresh className="w-8 h-8 animate-spin mx-auto mb-2 text-black" />
              <p className="text-xs sm:text-sm font-bold text-gray-600">Memuat antrean tiket...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center">
              <Icons.Check className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-black text-black">Tidak ada tiket dengan status {filter}.</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                Tiket baru akan otomatis masuk saat pengguna melaporkan produk atau mengunggah foto kemasan.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2.5 border-black text-xs font-black uppercase text-black bg-[#FFD027]/25">
                  <th className="py-3 px-3.5">Barcode</th>
                  <th className="py-3 px-3.5">Catatan / Rincian Pengguna</th>
                  <th className="py-3 px-3.5 text-center">Bukti Foto</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Tanggal Lapor</th>
                  <th className="py-3 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 text-xs">
                {tickets.map((t) => (
                  <TicketTableRow key={t.id} ticket={t} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
