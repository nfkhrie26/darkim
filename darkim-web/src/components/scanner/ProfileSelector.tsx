'use client';

import { HealthProfile } from '@/types';
import { Icons } from '@/components/ui/Icons';

interface ProfileSelectorProps {
  selectedProfile: HealthProfile;
  onSelectProfile: (profile: HealthProfile) => void;
}

export default function ProfileSelector({ selectedProfile, onSelectProfile }: ProfileSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Pilih Profil Kesehatan">
      {/* Profil Hipertensi */}
      <button
        type="button"
        role="radio"
        aria-checked={selectedProfile === 'hipertensi'}
        onClick={() => onSelectProfile('hipertensi')}
        title="Evaluasi Khusus Hipertensi (Natrium & Garam)"
        className={`brutal-border-sm brutal-shadow-sm rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer transition-all flex items-center gap-1.5 ${
          selectedProfile === 'hipertensi' ? 'bg-[#00D084] text-black' : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        <Icons.Heart className="w-3.5 h-3.5 text-black" />
        <span>Hipertensi</span>
      </button>

      {/* Profil Diabetes Melitus */}
      <button
        type="button"
        role="radio"
        aria-checked={selectedProfile === 'diabetes'}
        onClick={() => onSelectProfile('diabetes')}
        title="Evaluasi Khusus Diabetes Melitus (Gula & Karbohidrat)"
        className={`brutal-border-sm brutal-shadow-sm rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer transition-all flex items-center gap-1.5 ${
          selectedProfile === 'diabetes' ? 'bg-[#00D084] text-black' : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        <Icons.Sparkles className="w-3.5 h-3.5 text-black" />
        <span>Diabetes Melitus</span>
      </button>
    </div>
  );
}
