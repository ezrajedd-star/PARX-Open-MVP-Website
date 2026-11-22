"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "../ui/Button";
import { CloseIcon, MenuIcon, socialIcon } from "../ui/Icons";

interface Props {
  nav: { label: string; href: string }[];
  logo: string;
  logoAlt: string;
  social: { platform: keyof typeof socialIcon; label: string; url: string }[];
  fullName: string;
}

export function Header({ nav, logo, logoAlt, social, fullName }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/teams" && pathname.startsWith("/drivers")));

  return (
    <header className="sticky top-0 z-50 bg-navy text-white shadow-[0_1px_0_rgb(255_255_255/0.08)]">
      <div className={`container-x flex items-center gap-4 transition-[height] duration-200 ${compact ? "h-14" : "h-16 lg:h-[72px]"}`}>
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${logoAlt} — home`}>
          <Image src={logo} alt="" width={176} height={50} priority unoptimized className={`w-auto transition-[height] duration-200 ${compact ? "h-8" : "h-9 lg:h-11"}`} />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`relative block px-2.5 py-2 font-display text-[15px] font-bold uppercase tracking-wide transition-colors xl:px-3.5 xl:text-base ${
                    isActive(n.href) ? "text-gold" : "text-white/90 hover:text-white"
                  }`}
                >
                  {n.label}
                  {isActive(n.href) && <span className="absolute inset-x-2.5 -bottom-0.5 h-[3px] -skew-x-[24deg] bg-gold xl:inset-x-3.5" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/sponsorship#inquire" className={`${buttonClass("red", "sm")} ml-auto lg:ml-2`}>
          <span className="sm:hidden">Sponsor</span>
          <span className="hidden sm:inline">Become a Sponsor</span>
        </Link>

        <button
          ref={btnRef}
          type="button"
          className="-mr-2 grid h-11 w-11 place-items-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon width={26} height={26} /> : <MenuIcon width={26} height={26} />}
        </button>
      </div>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="dust-texture fixed inset-x-0 bottom-0 top-[var(--menu-top,64px)] z-40 overflow-y-auto bg-navy lg:hidden"
        style={{ ["--menu-top" as string]: compact ? "56px" : "64px" }}
      >
        <div className="speed-lines absolute inset-0" aria-hidden />
        <nav aria-label="Mobile" className="container-x relative flex min-h-full flex-col pb-10 pt-4">
          <ul className="space-y-1">
            {nav.map((n, i) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`flex items-baseline gap-3 py-2.5 font-display text-[2.1rem] font-extrabold uppercase italic leading-none ${isActive(n.href) ? "text-gold" : "text-white"}`}
                >
                  <span aria-hidden className="w-6 text-sm font-bold not-italic text-white/50 tabular">{String(i + 1).padStart(2, "0")}</span>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/sponsorship#inquire" className={`${buttonClass("red", "lg")} mt-8 w-full`}>
            Become a Sponsor
          </Link>
          <div className="mt-auto pt-10">
            <div className="livery mb-5 w-40" aria-hidden />
            <ul className="flex gap-2">
              {social.map((s) => {
                const Icon = socialIcon[s.platform];
                return (
                  <li key={s.platform}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center bg-white/10 hover:bg-white/20" aria-label={s.label}>
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/60">{fullName}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
