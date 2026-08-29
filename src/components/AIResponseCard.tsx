interface AIResponseCardProps {
  isLoading?: boolean;
  responseText?: string;
}

export default function AIResponseCard({
  isLoading = false,
  responseText = "",
}: AIResponseCardProps) {
  const parseResponse = (text: string) => {
    if (!text) return null;
    const amountMatch = text.match(/Rs\.\s*[\d,]+/);
    const amount = amountMatch ? amountMatch[0] : null;
    const lines = text.split("\n").filter((line) => line.trim());
    return { amount, lines };
  };

  const parsed = parseResponse(responseText);

  return (
    <div>
      <div className="doppelrand">
        <div className="doppelrand-inner p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full bg-[var(--cyan)] ${isLoading ? "animate-blink" : ""}`} />
            </div>
            <span className="text-xs uppercase tracking-[0.15em] text-white/30">
              {isLoading ? "Thinking..." : "Advisor"}
            </span>
          </div>

          {/* Loading State */}
          {isLoading && !responseText && (
            <div className="space-y-4">
              <div className="h-4 w-3/4 rounded-full bg-white/[0.03] animate-shimmer" />
              <div className="h-4 w-1/2 rounded-full bg-white/[0.03] animate-shimmer delay-100" />
              <div className="h-4 w-2/3 rounded-full bg-white/[0.03] animate-shimmer delay-200" />
            </div>
          )}

          {/* Response Content */}
          {responseText && (
            <div className="space-y-6">
              <div className="border-l-2 border-[var(--cyan)]/30 pl-6 space-y-4">
                {parsed?.lines.map((line, i) => {
                  const isAction = line.includes("ACTION") || line.includes("RECOMMEND") || line.includes("SAVE");
                  const isAmount = line.includes("Rs.");

                  if (isAction) {
                    return (
                      <p key={i} className="inline-block px-4 py-2 rounded-xl bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 text-[var(--cyan)] text-sm font-medium">
                        {line}
                      </p>
                    );
                  }
                  if (isAmount) {
                    return (
                      <p key={i} className="text-[var(--cyan)] font-medium">
                        {line}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="text-white/50 font-light leading-relaxed">
                      {line}
                    </p>
                  );
                })}
                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-[var(--cyan)]/60 animate-pulse rounded-sm" />
                )}
              </div>

              {parsed?.amount && !isLoading && (
                <div className="pt-4">
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Savings of{" "}
                    <span className="text-[var(--cyan)]">{parsed.amount}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !responseText && (
            <div className="text-center py-8">
              <p className="text-white/20 text-sm">Awaiting your query...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
