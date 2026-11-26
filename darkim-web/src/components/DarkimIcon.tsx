interface DarkimIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

/**
 * DarkimIcon
 * Neo-Brutalist brand icon featuring the emerald green "IM"
 * with the rounded underline bar.
 */
export default function DarkimIcon({
  size = 'md',
  className = '',
  showBorder = true,
}: DarkimIconProps) {
  const sizeConfig = {
    sm: {
      box: 'w-9 h-9 rounded-xl',
      text: 'text-base font-black',
      line: 'w-5 h-0.5 mt-0.5 rounded-full',
      border: showBorder ? 'brutal-border-sm brutal-shadow-sm' : '',
    },
    md: {
      box: 'w-14 h-14 rounded-2xl',
      text: 'text-2xl font-black',
      line: 'w-7 h-1 mt-1 rounded-full',
      border: showBorder ? 'brutal-border brutal-shadow' : '',
    },
    lg: {
      box: 'w-20 h-20 rounded-2xl',
      text: 'text-4xl font-black',
      line: 'w-11 h-1.5 mt-1 rounded-full',
      border: showBorder ? 'brutal-border brutal-shadow' : '',
    },
    xl: {
      box: 'w-24 h-24 rounded-3xl',
      text: 'text-5xl font-black',
      line: 'w-14 h-2 mt-1.5 rounded-full',
      border: showBorder ? 'brutal-border-lg brutal-shadow-lg' : '',
    },
  }[size];

  return (
    <div
      className={`bg-white flex flex-col items-center justify-center select-none shrink-0 ${sizeConfig.box} ${sizeConfig.border} ${className}`}
    >
      <div className="flex flex-col items-center leading-none">
        <span className={`tracking-tight text-[#00D084] leading-none ${sizeConfig.text}`}>
          IM
        </span>
        <span className={`bg-[#00D084] ${sizeConfig.line}`} />
      </div>
    </div>
  );
}
