interface AIResponseCardProps {
  isLoading?: boolean;
  responseText?: string;
}

export default function AIResponseCard({
  isLoading = false,
  responseText = "",
}: AIResponseCardProps) {
  // Parse response into structured parts
  const parseResponse = (text: string) => {
    if (!text) return null;

    // Try to extract amount
    const amountMatch = text.match(/Rs\.\s*[\d,]+/);
    const amount = amountMatch ? amountMatch[0] : null;

    // Split into lines for analysis
    const lines = text.split("\n").filter((line) => line.trim());

    return { amount, lines };
  };

  const parsed = parseResponse(responseText);

  return (
    <div className="border-2 border-[#00FFFF] bg-black relative group shadow-offset-cyan mt-4">
      {/* Header bar */}
      <div className="absolute top-0 left-0 bg-[#00FFFF] text-black font-mono text-sm md:text-base px-6 py-2 font-bold border-b-2 border-r-2 border-[#00FFFF] flex items-center gap-3">
        <div className={`w-2 h-2 bg-black rounded-full ${isLoading ? "animate-blink" : ""}`} />
        SYS_AI_ADVISOR // {isLoading ? "PROCESSING" : "RESPONSE"}
      </div>

      <div className="p-8 md:p-14 pt-20 md:pt-24">
        <div className="flex flex-col gap-12">
          {/* Loading State */}
          {isLoading && !responseText && (
            <div className="flex gap-6 md:gap-10 items-start">
              <iconify-icon
                icon="lucide:loader"
                class="text-5xl md:text-7xl text-[#00FFFF] shrink-0 mt-2 animate-spin"
              />
              <div className="space-y-4 w-full">
                <p className="font-mono text-xl md:text-2xl text-gray-500">
                  {">"} CONNECTING TO AI SYSTEM...
                </p>
                <p className="font-mono text-lg md:text-xl text-gray-600">
                  {">"} ANALYZING YOUR REQUEST
                </p>
              </div>
            </div>
          )}

          {/* Response Content */}
          {responseText && (
            <div className="flex gap-6 md:gap-10 items-start">
              <iconify-icon
                icon="lucide:terminal-square"
                class="text-5xl md:text-7xl text-[#00FFFF] shrink-0 mt-2"
              />
              <div className="space-y-8 w-full">
                {/* Main response text */}
                <div className="font-mono text-lg md:text-2xl text-gray-300 leading-relaxed border-l-4 border-[#00FFFF] pl-6 md:pl-8 space-y-4">
                  {parsed?.lines.map((line, i) => {
                    const isAction = line.includes("ACTION") || line.includes("RECOMMEND") || line.includes("SAVE");
                    const isAmount = line.includes("$");

                    if (isAction) {
                      return (
                        <p
                          key={i}
                          className="text-black font-bold bg-[#00FFFF] inline-block px-4 py-2 mt-2"
                        >
                          {line}
                        </p>
                      );
                    }

                    if (isAmount) {
                      return (
                        <p key={i} className="text-[#00FFFF] font-bold">
                          {line}
                        </p>
                      );
                    }

                    return (
                      <p key={i} className="text-gray-400">
                        {line}
                      </p>
                    );
                  })}

                  {/* Streaming cursor */}
                  {isLoading && (
                    <span className="inline-block w-3 h-5 bg-[#00FFFF] animate-pulse ml-1" />
                  )}
                </div>

                {/* Amount highlight if found */}
                {parsed?.amount && !isLoading && (
                  <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.2]">
                    Identified savings of{" "}
                    <span className="text-[#00FFFF]">{parsed.amount}</span>
                  </h3>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !responseText && (
            <div className="text-center py-12">
              <iconify-icon
                icon="lucide:bot"
                class="text-6xl text-gray-700 mb-4"
              />
              <p className="font-mono text-gray-500 text-lg">
                AWAITING YOUR QUERY...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
