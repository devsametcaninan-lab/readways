export default function ReaderPreparingOverlay() {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141d]/80 px-6 py-16"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-zinc-500">Preparing document…</p>
    </div>
  );
}
