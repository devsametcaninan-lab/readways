"use client";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  badge?: string;
};

type SettingsOptionGroupProps<T extends string> = {
  name: string;
  label: string;
  description?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export default function SettingsOptionGroup<T extends string>({
  name,
  label,
  description,
  value,
  options,
  onChange
}: SettingsOptionGroupProps<T>) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-zinc-200">{label}</legend>
      {description ? (
        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{description}</p>
      ) : null}

      <div
        className="mt-3 flex flex-col gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const selected = value === option.value;
          const inputId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition ${
                option.disabled
                  ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-60"
                  : selected
                    ? "border-accent/30 bg-accent/[0.08]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-sm text-zinc-200">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-[12px] text-slate-500">
                    {option.description}
                  </span>
                ) : null}
              </span>

              <span className="flex shrink-0 items-center gap-2">
                {option.badge ? (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {option.badge}
                  </span>
                ) : null}
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  disabled={option.disabled}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 accent-[#7c8cff]"
                />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
