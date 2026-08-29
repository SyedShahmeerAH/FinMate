interface StatusBadgeProps {
  status?: string;
  user?: string;
}

export default function StatusBadge({
  status = "LISTENING",
  user = "GUEST",
}: StatusBadgeProps) {
  return (
    <div className="eyebrow">
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "PROCESSING" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
      }`} />
      {status === "PROCESSING" ? "Processing" : "Ready"} — {user}
    </div>
  );
}
