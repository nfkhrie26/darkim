'use client';

import { HealthProfile } from '@/types';

interface ProfileSelectorProps {
  selectedProfile: HealthProfile;
  onSelectProfile: (profile: HealthProfile) => void;
}

export default function ProfileSelector({ selectedProfile, onSelectProfile }: ProfileSelectorProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap" role="radiogroup" aria-label="Pilih Profil Kesehatan">
      {/* Profil Hipertensi */}
      <button
        type="button"
        role="radio"
        aria-checked={selectedProfile === 'hipertensi'}
        onClick={() => onSelectProfile('hipertensi')}
        title="Tampilkan Evaluasi Khusus Hipertensi (Natrium, Garam & Jantung)"
        className={`brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer transition-all ${
          selectedProfile === 'hipertensi' ? 'bg-[#00D084] text-black' : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        Hipertensi
      </button>

      {/* Profil Diabetes Melitus */}
      <button
        type="button"
        role="radio"
        aria-checked={selectedProfile === 'diabetes'}
        onClick={() => onSelectProfile('diabetes')}
        title="Tampilkan Evaluasi Khusus Diabetes Melitus (Gula & Karbohidrat)"
        className={`brutal-border-sm brutal-shadow-sm rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wider brutal-btn cursor-pointer transition-all ${
          selectedProfile === 'diabetes' ? 'bg-[#00D084] text-black' : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        Diabetes Melitus
      </button>
    </div>
  );
}

