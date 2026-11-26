'use client';

import { SERVING_SIZE_UNITS, splitServingSize, ServingSizeUnit } from '@/lib/nutritionConversion';

interface ServingSizeInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Compound serving size control: numeric quantity input + standardized unit dropdown (ml, g, l, kg, mg).
 */
export default function ServingSizeInput({
  value,
  onChange,
  required = false,
  disabled = false,
}: ServingSizeInputProps) {
  const { amount, unit } = splitServingSize(value);
  const displayAmount = value.trim() === '' ? '' : amount;

  const handleAmountChange = (nextAmount: string) => {
    if (!nextAmount.trim()) {
      onChange('');
      return;
    }
    onChange(`${nextAmount} ${unit}`);
  };

  const handleUnitChange = (nextUnit: ServingSizeUnit) => {
    const safeAmount = displayAmount || '100';
    onChange(`${safeAmount} ${nextUnit}`);
  };

  return (
    <div className="flex items-stretch gap-1.5">
      <input
        type="number"
        step="any"
        min="0.01"
        required={required}
        disabled={disabled}
        value={displayAmount}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder="100"
        className="w-full min-w-0 bg-white brutal-border-sm rounded-xl p-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
      />
      <select
        value={unit}
        disabled={disabled}
        onChange={(e) => handleUnitChange(e.target.value as ServingSizeUnit)}
        aria-label="Satuan Takaran Saji"
        className="bg-white brutal-border-sm rounded-xl px-2.5 py-2 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shrink-0"
      >
        {SERVING_SIZE_UNITS.map((u) => (
          <option key={u.value} value={u.value}>
            {u.value}
          </option>
        ))}
      </select>
    </div>
  );
}
