"use client";

import { useState } from "react";

interface AIInputProps {
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

export default function AIInput({ onSubmit, disabled = false }: AIInputProps) {
  const [value, setValue] = useState("");

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

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-[#00FFFF] translate-x-3 translate-y-3 transition-transform duration-300" />
      <div className="border-2 border-white bg-black relative p-4 md:p-6 flex items-center gap-4 z-10">
        <span className="text-[#00FFFF] text-4xl md:text-5xl font-black pl-2">
          {">"}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "PROCESSING..." : "ASK ME ANYTHING..."}
          className="w-full bg-transparent text-white font-mono text-2xl md:text-3xl py-4 outline-none uppercase placeholder:text-gray-600 font-bold focus:placeholder:text-gray-800 transition-colors disabled:opacity-50"
          disabled={disabled}
          autoFocus={!disabled}
        />
        <div className="hidden md:flex gap-4 shrink-0">
          <button
            className="text-gray-400 hover:text-white px-4 py-4 font-mono text-2xl border-2 border-transparent hover:border-gray-600 transition-colors disabled:opacity-30"
            disabled={disabled}
          >
            <iconify-icon icon="lucide:mic" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="bg-white text-black px-8 py-4 font-bold text-2xl hover:bg-[#00FFFF] transition-colors border-2 border-black flex items-center gap-3 disabled:opacity-30 disabled:hover:bg-white"
          >
            EXECUTE
            <iconify-icon icon="lucide:corner-down-left" class="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
