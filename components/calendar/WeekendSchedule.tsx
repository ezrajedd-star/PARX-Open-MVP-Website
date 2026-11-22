import type { ScheduleBlock } from "@/lib/types";

/** Day-by-day weekend timeline. Groups consecutive blocks by day. */
export function WeekendSchedule({ schedule }: { schedule: ScheduleBlock[] }) {
  const days: { day: string; blocks: ScheduleBlock[] }[] = [];
  for (const b of schedule) {
    const last = days[days.length - 1];
    if (last && last.day === b.day) last.blocks.push(b);
    else days.push({ day: b.day, blocks: [b] });
  }
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {days.map((d) => (
        <li key={d.day} className="bg-white ring-1 ring-navy/10">
          <h3 className="heading bg-navy px-4 py-3 text-2xl text-white">{d.day}</h3>
          <ol className="divide-y divide-navy/10">
            {d.blocks.map((b, i) => (
              <li key={i} className="px-4 py-3">
                <p className="eyebrow text-red">{b.time}</p>
                <ul className="mt-2 space-y-1.5">
                  {b.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-[15px] font-medium text-navy">
                      <span className={`h-2 w-3 shrink-0 -skew-x-[24deg] ${/^Stage/i.test(it) ? "bg-gold" : /Award/i.test(it) ? "bg-red" : "bg-navy/25"}`} aria-hidden />
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
