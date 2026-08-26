interface StatusBadgeProps {
  status?: string;
  user?: string;
}

export default function StatusBadge({
  status = "LISTENING",
  user = "ALEX_STU",
}: StatusBadgeProps) {
  return (
    <div className="inline-flex border-2 border-gray-700 px-4 py-2 bg-[#0a0a0a]">
      <p className="font-mono text-sm md:text-base text-[#00FFFF] font-bold">
        {`> STATUS: ${status} // USER: ${user}`}
      </p>
    </div>
  );
}
