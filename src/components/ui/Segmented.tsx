/** iOS segmented control: gray track, white raised thumb. */
export default function Segmented<T extends string>({
  value, onChange, options, disabled = false
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: React.ReactNode }[];
  disabled?: boolean;
}) {
  return (
    <div className={`flex p-0.5 rounded-[10px] bg-fill ${disabled ? 'opacity-50' : ''}`}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[13px] font-semibold transition-colors ${
              on ? 'bg-card text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-ink/80'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
