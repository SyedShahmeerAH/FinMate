interface UserQueryCardProps {
  query: string;
  timestamp?: string;
}

export default function UserQueryCard({
  query,
  timestamp,
}: UserQueryCardProps) {
  const time = timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex justify-end">
      <div className="max-w-2xl rounded-[2rem] bg-white/[0.03] border border-white/[0.06] px-8 py-6 relative">
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[var(--bg)] border border-white/[0.06] text-[10px] uppercase tracking-widest text-white/20">
          {time}
        </div>
        <p className="text-base md:text-lg text-white/80 font-light leading-relaxed">
          &ldquo;{query}&rdquo;
        </p>
      </div>
    </div>
  );
}
