'use client';

interface TicketStatusBadgeProps {
  status: string;
}

export default function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#FFD027] text-black';
      case 'RESOLVED':
        return 'bg-[#00D084] text-black';
      default:
        return 'bg-[#FF4D4D] text-white';
    }
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase brutal-border-sm ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
}
