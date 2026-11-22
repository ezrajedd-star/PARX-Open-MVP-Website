/** Real photo when the file exists in /public, otherwise a branded placeholder. Server component. */
import Image from "next/image";
import { publicFileExists } from "@/lib/content";
import { Placeholder } from "./Placeholder";

export function Photo({
  src,
  alt,
  kind = "generic",
  className = "",
  sizes = "100vw",
  priority = false,
  accent,
  tone,
  placeholderLabel,
  showLabel,
}: {
  src: string | null | undefined;
  alt: string;
  kind?: "driver" | "car" | "hero" | "team" | "generic" | "merch";
  className?: string;
  sizes?: string;
  priority?: boolean;
  accent?: string;
  tone?: "navy" | "dust";
  placeholderLabel?: string;
  showLabel?: boolean;
}) {
  if (src && publicFileExists(src)) {
    return (
      <div className={`relative overflow-hidden bg-navy ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return <Placeholder kind={kind} className={className} accent={accent} tone={tone} label={placeholderLabel} showLabel={showLabel} />;
}
