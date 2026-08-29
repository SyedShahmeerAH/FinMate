"use client";

import { useState, useRef, useEffect } from "react";

interface AIInputProps {
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

export default function AIInput({ onSubmit, disabled = false }: AIInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = () => {
    if (value.trim() && onSubmit && !disabled) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasValue = value.trim().length > 0;

  return (
    <div>
      <div
        className={`
          doppelrand
          transition-all duration-700 ease-[var(--ease-fluid)]
          ${focused
            ? "shadow-[0_0_40px_rgba(0,255,255,0.06)]"
            : ""
          }
        `}
      >
        <div className="doppelrand-inner flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 relative overflow-hidden">
          {/* Subtle glow behind input on focus */}
          <div
            className={`
              absolute inset-0 pointer-events-none
              transition-opacity duration-700 ease-[var(--ease-fluid)]
              ${focused ? "opacity-100" : "opacity-0"}
            `}
            style={{
              background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(0,255,255,0.03) 0%, transparent 70%)",
            }}
          />

          {/* Prompt indicator — animated on focus */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10
              transition-all duration-500 ease-[var(--ease-fluid)]
              ${focused
                ? "bg-[var(--cyan)]/15 border border-[var(--cyan)]/30 shadow-[0_0_12px_rgba(0,255,255,0.15)]"
                : "bg-white/[0.03] border border-white/[0.06]"
              }
            `}
          >
            <span
              className={`
                text-sm font-bold
                transition-colors duration-500 ease-[var(--ease-fluid)]
                ${focused ? "text-[var(--cyan)]" : "text-white/20"}
              `}
            >
              {">"}
            </span>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={disabled ? "Processing..." : "Ask me anything..."}
            className="flex-1 bg-transparent text-white text-base md:text-lg py-2 outline-none placeholder:text-white/15 font-light relative z-10"
            disabled={disabled}
          />

          {/* Right side — character hint + submit */}
          <div className="flex items-center gap-2.5 relative z-10">
            {/* Keyboard shortcut hint — show when empty and focused */}
            <span
              className={`
                hidden md:flex items-center gap-1 text-[10px] text-white/10
                transition-all duration-500 ease-[var(--ease-fluid)]
                ${!hasValue && focused ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}
              `}
            >
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[9px]">↵</kbd>
            </span>

            {/* Submit button — pill with nested icon (Button-in-Button pattern) */}
            <button
              onClick={handleSubmit}
              disabled={disabled || !hasValue}
              className={`
                group flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium
                transition-all duration-500 ease-[var(--ease-fluid)]
                active:scale-[0.97]
                ${hasValue && !disabled
                  ? "bg-[var(--cyan)] text-black hover:shadow-[0_0_24px_rgba(0,255,255,0.2)]"
                  : "bg-white/[0.04] text-white/30 border border-white/[0.04]"
                }
                disabled:pointer-events-none
              `}
            >
              <span className="hidden md:inline">
                {disabled ? "..." : "Send"}
              </span>
              {/* Nested icon circle — diagonal translate on hover */}
              <span
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  transition-all duration-500 ease-[var(--ease-fluid)]
                  ${hasValue && !disabled
                    ? "bg-black/10 group-hover:bg-black/20 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105"
                    : "bg-white/[0.04]"
                  }
                `}
              >
                <iconify-icon
                  icon={disabled ? "lucide:loader-2" : "lucide:arrow-up"}
                  class={`text-xs ${disabled ? "animate-spin" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
