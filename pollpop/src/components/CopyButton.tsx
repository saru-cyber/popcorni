"use client";

import { useState } from "react";

type CopyButtonProps = {
  label: string;
  value: string;
  className?: string;
};

export function CopyButton({
  label,
  value,
  className = "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${className}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
