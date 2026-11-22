"use client";
import { useState } from "react";

/** Click-to-load video embed — keeps third-party players off the critical path. */
export function VideoFacade({ src, title, thumb }: { src: string; title: string; thumb?: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative my-8 aspect-video overflow-hidden bg-navy">
      {on ? (
        <iframe src={src} title={title} className="absolute inset-0 h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {thumb && <img src={thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
          <span className="relative grid h-16 w-16 place-items-center bg-red text-white transition group-hover:scale-110 [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
