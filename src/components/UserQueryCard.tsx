interface UserQueryCardProps {
  query: string;
  timestamp?: string;
}

export default function UserQueryCard({
  query,
  timestamp = "10:42 AM",
}: UserQueryCardProps) {
  return (
    <div className="flex justify-end">
      <div className="border-2 border-gray-700 p-8 md:p-10 bg-[#0a0a0a] max-w-4xl relative shadow-offset">
        <div className="absolute -top-4 right-8 bg-black px-4 text-gray-500 font-mono text-sm border-2 border-gray-700">
          USER_QUERY // {timestamp}
        </div>
        <p className="font-mono text-2xl md:text-3xl text-white font-bold leading-relaxed uppercase">
          &ldquo;{query}&rdquo;
        </p>
      </div>
    </div>
  );
}
