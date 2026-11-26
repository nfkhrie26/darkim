'use client';

export default function AboutSection() {
  return (
    <section className="w-full mb-8">
      {/* Section Heading */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Tentang DARKIM
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 max-w-2xl">
          Memahami mengapa evaluasi nilai gizi pangan kemasan sangat krusial bagi pencegahan penyakit degeneratif.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Tantangan Takaran Saji */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#FFD027] brutal-border-sm flex items-center justify-center font-black text-sm text-black mb-4 select-none">
              01
            </div>
            <h3 className="text-base font-black text-black mb-2">
              Jebakan Takaran Saji
            </h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Banyak konsumen salah memahami label kemasan. Nilai gizi yang tercantum di tabel biasanya dihitung <b>per sajian</b> (misalnya 100ml), bukan satu botol penuh (200ml atau 250ml). Jika dihabiskan sekaligus, asupan gula atau garam menjadi dua kali lipat lebih tinggi dari yang diperkirakan.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t-2 border-black/10 text-[11px] font-bold text-gray-500">
            Penyederhanaan kalkulasi saji secara otomatis.
          </div>
        </div>

        {/* Pillar 2: Pendekatan Personalisasi */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#00D084] brutal-border-sm flex items-center justify-center font-black text-sm text-black mb-4 select-none">
              02
            </div>
            <h3 className="text-base font-black text-black mb-2">
              Evaluasi Berbasis Profil
            </h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Kebutuhan setiap individu berbeda. DARKIM membagi penilaian menjadi dua profil spesifik: <b>Diabetes Melitus</b> yang menitikberatkan pada kandungan gula dan karbohidrat, serta <b>Hipertensi</b> yang memonitor ketat batas toleransi natrium/garam dan lemak jenuh.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t-2 border-black/10 text-[11px] font-bold text-gray-500">
            Status Aman, Perhatikan, atau Batasi secara objektif.
          </div>
        </div>

        {/* Pillar 3: Standar Resmi BPOM & Kemenkes */}
        <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-gray-100 brutal-border-sm flex items-center justify-center font-black text-sm text-black mb-4 select-none">
              03
            </div>
            <h3 className="text-base font-black text-black mb-2">
              Berdasarkan Standar Resmi
            </h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Algoritma keputusan mengadopsi regulasi Informasi Nilai Gizi BPOM serta rekomendasi harian Kementerian Kesehatan RI (G4-G1-L5: Maksimal 50g Gula, 2000mg Natrium, dan 67g Lemak per hari) yang diselaraskan dengan database terbuka <b>Open Food Facts</b>.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t-2 border-black/10 text-[11px] font-bold text-gray-500">
            Sumber terbuka, independen, dan ilmiah.
          </div>
        </div>
      </div>
    </section>
  );
}
