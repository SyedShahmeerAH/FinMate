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
    <div className="flex flex-wrap items-center gap-4 mt-2">
      <span className="text-sm md:text-base font-mono text-gray-500 mr-2 uppercase">
        SUGGESTED_QUERIES:
      </span>
      {queries.map((query) => (
        <button
          key={query}
          onClick={() => onSelect?.(query)}
          className="border-2 border-gray-800 bg-[#0a0a0a] text-gray-400 hover:text-black hover:bg-[#00FFFF] hover:border-[#00FFFF] px-5 py-3 font-mono text-sm md:text-base transition-colors uppercase"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
