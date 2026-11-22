"use client";
import Link from "next/link";
import { useLegs } from "../layout/LegStatusProvider";
import { buttonClass } from "../ui/Button";
import { ArrowRight } from "../ui/Icons";

export function NextLegLink({ variant = "gold" }: { variant?: "gold" | "red" }) {
  const { legs, statuses } = useLegs();
  const leg = legs.find((l) => statuses[l.slug] === "live") ?? legs.find((l) => statuses[l.slug] === "next");
  return (
    <Link href={leg ? `/calendar/${leg.slug}` : "/calendar"} className={buttonClass(variant, "lg")}>
      Find us at the next leg{leg ? ` — ${leg.name}` : ""} <ArrowRight width={18} height={18} />
    </Link>
  );
}
