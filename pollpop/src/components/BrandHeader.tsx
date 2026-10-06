"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PopcorniAccountLinks } from "@/components/popcorni/PopcorniAccountLinks";

export function BrandHeader({
  rightSlot,
  title,
  titleClassName = "text-slate-400",
  brandClassName = "text-cyan-300 group-hover:text-cyan-200",
  liveClassName = "text-slate-500",
  className = "mb-8",
}: {
  rightSlot?: ReactNode;
  title?: ReactNode;
  titleClassName?: string;
  brandClassName?: string;
  liveClassName?: string;
  className?: string;
}) {
  return (
    <header
      className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 ${className}`}
    >
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <Link href="/" className="group flex shrink-0 items-baseline gap-1">
          <span
            className={`font-[family-name:var(--font-display)] text-3xl font-black tracking-tight transition ${brandClassName}`}
          >
            PollPop
          </span>
          <span
            className={`text-xs font-medium uppercase tracking-widest ${liveClassName}`}
          >
            live
          </span>
        </Link>
        {title ? (
          <h1
            className={`min-w-0 font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight sm:text-base ${titleClassName}`}
          >
            {title}
          </h1>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {rightSlot}
        <PopcorniAccountLinks />
      </div>
    </header>
  );
}
