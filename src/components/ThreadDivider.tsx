interface ThreadDividerProps {
  label?: string;
}

export default function ThreadDivider({
  label = "SESSION_HISTORY",
}: ThreadDividerProps) {
  return (
    <div className="w-full flex items-center gap-6 opacity-60 my-4">
      <div className="h-px flex-1 border-b-2 border-dashed border-gray-700" />
      <span className="text-gray-500 font-mono text-sm md:text-base font-bold uppercase tracking-widest">
        {label}
      </span>
      <div className="h-px flex-1 border-b-2 border-dashed border-gray-700" />
    </div>
  );
}
