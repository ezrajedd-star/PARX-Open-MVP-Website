"use client";
import { useState, type ReactNode } from "react";

const PAGE = 9;

export function NewsGrid({ items, categories }: { items: { key: string; category: string; node: ReactNode }[]; categories: string[] }) {
  const [cat, setCat] = useState<string>("All");
  const [count, setCount] = useState(PAGE);
  const filtered = items.filter((i) => cat === "All" || i.category === cat);
  const shown = filtered.slice(0, count);
  return (
    <>
      <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => {
              setCat(c);
              setCount(PAGE);
            }}
            className={`h-10 shrink-0 px-4 font-display text-[15px] font-bold uppercase italic tracking-wide ring-1 transition ${cat === c ? "bg-red text-white ring-red" : "bg-white text-navy ring-navy/20 hover:ring-navy"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} of {filtered.length} articles
      </p>
      {shown.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {shown.map((i) => (
            <li key={i.key} className="flex [&>*]:w-full">
              {i.node}
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-white p-8 text-center text-ink/70 ring-1 ring-navy/10">No {cat} articles yet — check back soon.</p>
      )}
      {filtered.length > count && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setCount((c) => c + PAGE)} className="h-12 border-2 border-navy px-8 font-display text-base font-bold uppercase italic tracking-wide text-navy hover:bg-navy hover:text-white">
            Load more
          </button>
        </div>
      )}
    </>
  );
}
