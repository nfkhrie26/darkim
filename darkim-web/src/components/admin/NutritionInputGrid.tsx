'use client';

export interface NutritionValues {
  energy: string;
  carbohydrates: string;
  sugars: string;
  fat: string;
  saturatedFat: string;
  proteins: string;
  sodium: string;
  fiber: string;
}

interface NutritionInputGridProps {
  values: NutritionValues;
  onChange: (field: keyof NutritionValues, value: string) => void;
  disabled?: boolean;
}

export default function NutritionInputGrid({
  values,
  onChange,
  disabled = false,
}: NutritionInputGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Energi / Kalori */}
      <div className="bg-gray-50 brutal-border-sm rounded-xl p-3">
        <label className="font-bold text-black text-xs block mb-1">Energi / Kalori</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.energy}
            onChange={(e) => onChange('energy', e.target.value)}
            placeholder="80"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">kkal</span>
        </div>
      </div>

      {/* 2. Karbohidrat Total */}
      <div className="bg-gray-50 brutal-border-sm rounded-xl p-3">
        <label className="font-bold text-black text-xs block mb-1">Karbohidrat Total</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.carbohydrates}
            onChange={(e) => onChange('carbohydrates', e.target.value)}
            placeholder="12"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">g</span>
        </div>
      </div>

      {/* 3. Gula Total (Diabetes Key Parameter) */}
      <div className="bg-amber-50/70 brutal-border-sm rounded-xl p-3">
        <label className="font-black text-amber-950 text-xs block mb-1">Gula Total (Sugars)</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.sugars}
            onChange={(e) => onChange('sugars', e.target.value)}
            placeholder="9"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">g</span>
        </div>
        <span className="text-[10px] text-amber-900 font-semibold mt-1 block">
          Evaluasi Diabetes
        </span>
      </div>

      {/* 4. Lemak Total */}
      <div className="bg-gray-50 brutal-border-sm rounded-xl p-3">
        <label className="font-bold text-black text-xs block mb-1">Lemak Total (Fat)</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.fat}
            onChange={(e) => onChange('fat', e.target.value)}
            placeholder="3"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">g</span>
        </div>
      </div>

      {/* 5. Lemak Jenuh (Hypertension Key Parameter) */}
      <div className="bg-rose-50/70 brutal-border-sm rounded-xl p-3">
        <label className="font-black text-rose-950 text-xs block mb-1">Lemak Jenuh (Sat. Fat)</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.saturatedFat}
            onChange={(e) => onChange('saturatedFat', e.target.value)}
            placeholder="1.5"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">g</span>
        </div>
        <span className="text-[10px] text-rose-900 font-semibold mt-1 block">
          Evaluasi Hipertensi
        </span>
      </div>

      {/* 6. Protein */}
      <div className="bg-gray-50 brutal-border-sm rounded-xl p-3">
        <label className="font-bold text-black text-xs block mb-1">Protein</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.proteins}
            onChange={(e) => onChange('proteins', e.target.value)}
            placeholder="3"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">g</span>
        </div>
      </div>

      {/* 7. Natrium / Sodium (Hypertension Key Parameter) */}
      <div className="bg-rose-50/70 brutal-border-sm rounded-xl p-3">
        <label className="font-black text-rose-950 text-xs block mb-1">Natrium / Sodium</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.sodium}
            onChange={(e) => onChange('sodium', e.target.value)}
            placeholder="45"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">mg</span>
        </div>
        <span className="text-[10px] text-rose-900 font-semibold mt-1 block">
          Di-sync ke OFF otomatis jadi garam
        </span>
      </div>

      {/* 8. Serat Pangan */}
      <div className="bg-gray-50 brutal-border-sm rounded-xl p-3">
        <label className="font-bold text-black text-xs block mb-1">Serat Pangan (Fiber)</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            disabled={disabled}
            value={values.fiber}
            onChange={(e) => onChange('fiber', e.target.value)}
            placeholder="1"
            className="w-full bg-white brutal-border-sm rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs font-black text-gray-600">g</span>
        </div>
      </div>
    </div>
  );
}
