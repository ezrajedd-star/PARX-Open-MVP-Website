import Image from "next/image";
import { photo } from "@/lib/content";
import { Placeholder } from "../ui/Placeholder";

/** Round-cornered driver headshot using the /images/drivers/{slug}.jpg convention. */
export function DriverAvatar({ slug, name, className = "h-12 w-12", accent, sizes = "64px" }: { slug: string; name: string; className?: string; accent?: string; sizes?: string }) {
  const src = photo("drivers", slug);
  if (src)
    return (
      <div className={`relative overflow-hidden bg-navy ${className}`}>
        <Image src={src} alt={name} fill sizes={sizes} className="object-cover object-top" />
      </div>
    );
  return <Placeholder kind="driver" className={className} accent={accent} showLabel={false} label={`${name} — photo coming soon`} />;
}
