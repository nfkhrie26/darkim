'use client';

import { TicketModel } from '@/types';
import { parseTicketDescription } from '@/hooks/useTicketDetail';

interface TicketInfoCardProps {
  ticket: TicketModel;
}

export default function TicketInfoCard({ ticket }: TicketInfoCardProps) {
  const parsed = parseTicketDescription(ticket.description);

  return (
    <div className="bg-white brutal-border brutal-shadow rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b-2.5 border-black pb-3">
        <span className="bg-[#FFD027] brutal-border-sm px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-black">
          Tiket #{ticket.id.slice(0, 8)}
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase brutal-border-sm ${
            ticket.status === 'PENDING'
              ? 'bg-[#FFD027] text-black'
              : ticket.status === 'RESOLVED'
              ? 'bg-[#00D084] text-black'
              : 'bg-[#FF4D4D] text-white'
          }`}
        >
          {ticket.status}
        </span>
      </div>

      <div>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
          Barcode Produk
        </label>
        <div className="text-2xl font-black font-mono text-black mt-0.5">{ticket.barcode}</div>
      </div>

      {ticket.description && (
        <div className="bg-gray-100 brutal-border-sm rounded-xl p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1">
            Catatan / Rincian Pengguna:
          </span>
          {parsed.isManualInput ? (
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-black flex items-center gap-1.5 flex-wrap">
                <span>{parsed.productName}</span>
                <span className="bg-[#00D084] text-black px-2 py-0.5 rounded text-[9px] font-black uppercase brutal-border-sm">
                  Input Mandiri User
                </span>
              </span>
              {parsed.userNote && (
                <p className="text-gray-600 italic mt-0.5">&ldquo;{parsed.userNote}&rdquo;</p>
              )}
            </div>
          ) : (
            <p className="text-xs font-semibold text-black">{ticket.description}</p>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600 font-medium pt-1">
        Dilaporkan pada:{' '}
        <b className="text-black">
          {new Date(ticket.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </b>
      </div>
    </div>
  );
}
