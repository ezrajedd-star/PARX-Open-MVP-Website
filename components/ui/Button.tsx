import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "./Icons";

type Variant = "red" | "gold" | "light" | "dark" | "ghost-light" | "ghost-dark";
const styles: Record<Variant, string> = {
  red: "bg-red text-white hover:bg-red-dark",
  gold: "bg-gold text-navy hover:bg-[#ffbb1a]",
  light: "bg-white text-navy hover:bg-dust",
  dark: "bg-navy text-white hover:bg-navy-soft",
  "ghost-light": "border-2 border-white/80 text-white hover:bg-white hover:text-navy",
  "ghost-dark": "border-2 border-navy text-navy hover:bg-navy hover:text-white",
};

export function buttonClass(variant: Variant = "red", size: "md" | "lg" | "sm" = "md") {
  const sz = size === "lg" ? "h-13 px-6 text-lg" : size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-base";
  // Solid buttons get the slanted broadcast edge via clip-path; outlined ones would lose their
  // border to the clip, so they get a slight skew instead.
  const shape = variant.startsWith("ghost") ? "-skew-x-6 [&>*]:skew-x-6" : "[clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]";
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold uppercase italic tracking-wide transition-colors ${shape} ${sz} ${styles[variant]}`;
}

export function LinkButton({
  href,
  children,
  variant = "red",
  size = "md",
  arrow = false,
  className = "",
  ...rest
}: { href: string; children: ReactNode; variant?: Variant; size?: "md" | "lg" | "sm"; arrow?: boolean } & Omit<ComponentProps<typeof Link>, "href">) {
  const external = /^(https?:|mailto:|tel:)/.test(href) || href.endsWith(".pdf");
  const cls = `${buttonClass(variant, size)} ${className}`;
  const inner = (
    <>
      {children}
      {arrow && <ArrowRight width={18} height={18} />}
    </>
  );
  if (external)
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  );
}
