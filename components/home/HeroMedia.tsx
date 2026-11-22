import Image from "next/image";
import { publicFileExists } from "@/lib/content";
import { CarSilhouette } from "../ui/Placeholder";

/** Full-bleed hero media: video → image → branded "car mid-drift in dust" placeholder. */
export function HeroMedia({ image, video, poster }: { image: string | null; video: string | null; poster: string | null }) {
  if (video && publicFileExists(video))
    return (
      <video className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" autoPlay muted loop playsInline poster={poster ?? undefined} aria-hidden>
        <source src={video} />
      </video>
    );
  if (image && publicFileExists(image)) return <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />;
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy" aria-hidden>
      <div className="speed-lines absolute inset-0" />
      {/* dust plume */}
      <div className="absolute right-[-20%] top-[2%] h-[45%] md:top-auto md:-bottom-24 md:h-[85%] w-[120%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(233_228_218/.55),rgb(233_228_218/.18)_55%,transparent)] blur-2xl md:right-[-5%] md:w-[80%]" />
      <div className="absolute bottom-[8%] right-[30%] h-[40%] w-[60%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(214_190_150/.45),transparent)] blur-xl md:right-[35%] md:w-[40%]" />
      <div className="absolute -right-10 top-0 h-full w-[60%] -skew-x-[24deg] bg-gradient-to-l from-red/30 to-transparent" />
      {/* car mid-drift */}
      <div className="absolute right-[-18%] top-[13%] w-[105%] max-w-[760px] rotate-[-4deg] md:top-auto md:bottom-[12%] md:right-[4%] md:w-[55%]">
        <CarSilhouette className="w-full -skew-x-6 drop-shadow-[0_30px_30px_rgba(0,0,0,.45)]" color="rgb(255 255 255 / .2)" />
      </div>
      <div className="dust-texture absolute inset-0" />
      <span className="absolute right-3 top-3 rounded-sm bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 md:right-6 md:top-6">
        Photo / video placeholder — car mid-drift in dust
      </span>
    </div>
  );
}
