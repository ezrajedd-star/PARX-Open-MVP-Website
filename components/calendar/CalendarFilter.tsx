"use client";
import { useState, type ReactNode } from "react";

type Group = "All" | "Visayas" | "Mindanao";

export function CalendarFilter({ items }: { items: { key: string; group: "Visayas" | "Mindanao"; node: ReactNode }[] }) {
  const [g, setG] = useState<Group>("All");
  const groups: Group[] = ["All", "Visayas", "Mindanao"];
  const visible = items.filter((i) => g === "All" || i.group === g);
  return (
    <>
      <div role="group" aria-label="Filter by island group" className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        {groups.map((x) => {
          const count = x === "All" ? items.length : items.filter((i) => i.group === x).length;
          return (
            <button
              key={x}
              type="button"
              aria-pressed={g === x}
              onClick={() => setG(x)}
              className={`h-10 shrink-0 px-4 font-display text-base font-bold uppercase italic tracking-wide ring-1 transition ${
                g === x ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/20 hover:ring-navy"
              }`}
            >
              {x} <span className="ml-1 opacity-60 tabular">{count}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} legs
      </p>
      <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {visible.map((i) => (
          <li key={i.key} className="flex [&>*]:w-full">
            {i.node}
          </li>
        ))}
      </ul>
    </>
  );
}
