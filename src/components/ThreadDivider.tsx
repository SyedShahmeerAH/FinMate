interface ThreadDividerProps {
  label?: string;
}

export default function ThreadDivider({
  label = "Previous",
}: ThreadDividerProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}
