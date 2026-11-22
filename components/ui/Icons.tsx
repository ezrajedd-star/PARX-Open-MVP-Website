import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { title?: string };
const base = (p: P) => ({ width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": p.title ? undefined : true, focusable: false, ...p });

export const FacebookIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" /></svg>
);
export const YoutubeIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM10 15.1V8.9l5.2 3.1L10 15.1Z" /></svg>
);
export const InstagramIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);
export const TiktokIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" /></svg>
);
export const XIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
);
export const MessengerIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor"><path d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.4 3.2 7.2v3.4l3-1.7c1.2.3 2.4.5 3.8.5 5.6 0 10-4.1 10-9.7S17.6 2 12 2Zm1 13-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7L13 15Z" /></svg>
);
export const LinkIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const MinusIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M7 12h10" /></svg>
);
export const TriangleUp = (p: P) => (
  <svg {...base(p)} viewBox="0 0 10 10" fill="currentColor"><path d="M5 1.5 9.5 8.5h-9Z" /></svg>
);
export const TriangleDown = (p: P) => (
  <svg {...base(p)} viewBox="0 0 10 10" fill="currentColor"><path d="M5 8.5.5 1.5h9Z" /></svg>
);
export const DownloadIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);

export const socialIcon = { facebook: FacebookIcon, youtube: YoutubeIcon, instagram: InstagramIcon, tiktok: TiktokIcon, x: XIcon } as const;
