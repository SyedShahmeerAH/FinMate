"use client";

interface ActionButtonsProps {
  onExecute?: () => void;
  onModify?: () => void;
}

export default function ActionButtons({
  onExecute,
  onModify,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-8 border-t border-white/[0.04] animate-fade-in-up delay-200">
      {/* Execute — pill with trailing icon */}
      <button
        onClick={onExecute}
        className="group flex items-center justify-between bg-[var(--cyan)] text-black px-8 py-4 rounded-full font-medium text-base hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97]"
      >
        <span>Execute Plan</span>
        <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
          <iconify-icon icon="lucide:check" class="text-sm" />
        </span>
      </button>

      {/* Modify — glass pill */}
      <button
        onClick={onModify}
        className="group flex items-center justify-between bg-white/[0.04] border border-white/[0.06] text-white px-8 py-4 rounded-full font-medium text-base hover:bg-white/[0.08] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97]"
      >
        <span>Modify</span>
        <span className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center transition-all duration-300 group-hover:rotate-90">
          <iconify-icon icon="lucide:sliders" class="text-sm" />
        </span>
      </button>
    </div>
  );
}
