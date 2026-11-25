'use client';

import Link from 'next/link';
import { TicketModel } from '@/types';
import TicketStatusBadge from './TicketStatusBadge';
import { parseTicketDescription } from '@/hooks/useTicketDetail';

interface TicketTableRowProps {
  ticket: TicketModel;
}

export default function TicketTableRow({ ticket }: TicketTableRowProps) {
  const parsed = parseTicketDescription(ticket.description);

  return (
    <tr className="hover:bg-[#E6F1EA]/30 transition-colors">
      {/* 1. Barcode */}
      <td className="py-3.5 px-3.5 font-mono font-bold text-black">{ticket.barcode}</td>

      {/* 2. Catatan / Rincian Pengguna */}
      <td className="py-3.5 px-3.5 font-medium text-gray-800 max-w-sm">
        {parsed.isManualInput ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-black">{parsed.productName}</span>
              <span className="bg-[#00D084] text-black px-2 py-0.5 rounded-md text-[9px] font-black uppercase brutal-border-sm">
                Input Mandiri User
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-mono">
              Gula: {parsed.sugars ?? '-'}g | Lemak Jenuh: {parsed.saturatedFat ?? '-'}g | Natrium: {parsed.sodium ?? '-'}mg
            </span>
          </div>
        ) : ticket.description ? (
          <span className="truncate block">{ticket.description}</span>
        ) : (
          <span className="text-gray-400 italic">(Tanpa catatan)</span>
        )}
      </td>

      {/* 3. Bukti Foto */}
      <td className="py-3.5 px-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {ticket.frontPhoto ? (
            <span className="bg-emerald-100 text-emerald-950 brutal-border-sm px-2 py-0.5 rounded-md text-[10px] font-bold">
              Depan ✓
            </span>
          ) : null}
          {ticket.nutritionPhoto ? (
            <span className="bg-blue-100 text-blue-950 brutal-border-sm px-2 py-0.5 rounded-md text-[10px] font-bold">
              Gizi ✓
            </span>
          ) : null}
          {!ticket.frontPhoto && !ticket.nutritionPhoto && (
            <span className="text-gray-400 text-[10px] font-semibold">-</span>
          )}
        </div>
      </td>

      {/* 4. Status */}
      <td className="py-3.5 px-3.5 text-center">
        <TicketStatusBadge status={ticket.status} />
      </td>

      {/* 5. Tanggal Lapor */}
      <td className="py-3.5 px-3.5 text-center text-gray-600 font-medium">
        {new Date(ticket.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </td>

      {/* 6. Aksi */}
      <td className="py-3.5 px-3.5 text-right">
        <Link
          href={`/admin/tickets/${ticket.id}`}
          className="bg-black text-white hover:bg-gray-800 brutal-border-sm brutal-shadow-sm px-3.5 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider brutal-btn inline-block text-center cursor-pointer"
        >
          {ticket.status !== 'PENDING'
            ? 'Lihat Detail'
            : parsed.isManualInput
            ? 'Tinjau & ACC'
            : 'Eksekusi Tiket'}
        </Link>
      </td>
    </tr>
  );
}
