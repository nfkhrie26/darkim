'use client';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-white brutal-border brutal-shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm sm:max-w-md">
        <span className="w-3 h-3 rounded-full bg-[#00D084] shrink-0 border border-black animate-pulse" />
        <p className="text-xs sm:text-sm font-black text-black leading-snug">
          {message}
        </p>
      </div>
    </div>
  );
}

