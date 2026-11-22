"use client";
import { useState } from "react";
import { FacebookIcon, LinkIcon, MessengerIcon, XIcon } from "../ui/Icons";

/** Facebook, Messenger, X and copy-link. Messenger uses the native share sheet on mobile when available. */
export function ShareButtons({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const btn = "grid h-11 w-11 place-items-center text-white transition hover:opacity-90";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const messenger = (e: React.MouseEvent) => {
    if (typeof navigator !== "undefined" && "share" in navigator && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      e.preventDefault();
      navigator.share({ title, url }).catch(() => {});
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!compact && <span className="eyebrow mr-1 text-ink/60">Share</span>}
      <a className={`${btn} bg-[#0B57D0]`} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <FacebookIcon />
      </a>
      <a className={`${btn} bg-[#7B2FF7]`} href={`fb-messenger://share/?link=${u}`} onClick={messenger} aria-label="Share on Messenger">
        <MessengerIcon />
      </a>
      <a className={`${btn} bg-ink`} href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
        <XIcon width={18} height={18} />
      </a>
      <button type="button" onClick={copy} className={`${btn} bg-navy`} aria-label="Copy link">
        <LinkIcon />
      </button>
      <span role="status" aria-live="polite" className="text-sm font-semibold text-navy">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
