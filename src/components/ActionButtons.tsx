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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-8 border-t-2 border-dashed border-gray-700">
      <button
        onClick={onExecute}
        className="w-full bg-[#00FFFF] text-black text-2xl md:text-3xl font-black py-6 px-8 hover:bg-white border-2 border-[#00FFFF] hover:border-white transition-colors uppercase flex items-center justify-between group shadow-offset-lg shadow-offset-lg-hover"
      >
        <span>EXECUTE_PLAN</span>
        <iconify-icon
          icon="lucide:check-square"
          class="text-4xl group-hover:scale-110 transition-transform"
        />
      </button>
      <button
        onClick={onModify}
        className="w-full bg-black text-white text-2xl md:text-3xl font-black py-6 px-8 hover:bg-gray-900 border-2 border-white transition-colors uppercase flex items-center justify-between group"
      >
        <span>MODIFY_PARAMS</span>
        <iconify-icon
          icon="lucide:sliders-horizontal"
          class="text-4xl group-hover:rotate-90 transition-transform"
        />
      </button>
    </div>
  );
}
