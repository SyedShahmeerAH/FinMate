"use client";

interface SuggestedQueriesProps {
  queries?: string[];
  onSelect?: (query: string) => void;
}

const defaultQueries = [
  "Cancel Inactive Subscriptions",
  "Optimize Grocery Budget",
  "Textbook Shortfall Fix",
];

export default function SuggestedQueries({
  queries = defaultQueries,
  onSelect,
}: SuggestedQueriesProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3">
      <span className="text-xs text-white/20 mr-1 uppercase tracking-widest">
        Try
      </span>
      {queries.map((query, i) => (
        <button
          key={query}
          onClick={() => onSelect?.(query)}
          className="px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/40 text-sm hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97]"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
