"use client";

type SettingsToggleProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function SettingsToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false
}: SettingsToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-200">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
          checked
            ? "border-accent/40 bg-accent/25"
            : "border-white/[0.12] bg-white/[0.04]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
