/** Components available inside news MDX files: <Gallery>, <YouTube>, <FacebookVideo>, plus images. */
import Image from "next/image";
import { publicFileExists } from "@/lib/content";
import { Photo } from "../ui/Photo";
import { Placeholder } from "../ui/Placeholder";
import { VideoFacade } from "./VideoFacade";

function Gallery({ images }: { images: { src: string | null; alt: string; caption?: string }[] }) {
  return (
    <figure className="not-prose my-8">
      <ul className={`grid gap-2 ${images.length >= 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"}`}>
        {images.map((im, i) => (
          <li key={i} className={images.length === 3 && i === 0 ? "col-span-2 md:col-span-1" : ""}>
            <Photo src={im.src} alt={im.alt} kind="generic" className="aspect-[4/3]" sizes="(min-width:768px) 33vw, 50vw" placeholderLabel={im.alt} />
            {im.caption && <figcaption className="mt-1 text-xs text-ink/60">{im.caption}</figcaption>}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function YouTube({ id, title = "Video" }: { id: string; title?: string }) {
  if (!id || id === "PLACEHOLDER") return <Placeholder kind="hero" className="my-8 aspect-video" label={`${title}`} />;
  return <VideoFacade title={title} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`} thumb={`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`} />;
}

function FacebookVideo({ href, title = "Facebook video" }: { href: string; title?: string }) {
  if (!href || href === "PLACEHOLDER") return <Placeholder kind="hero" className="my-8 aspect-video" label={title} />;
  return <VideoFacade title={title} src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&autoplay=true`} />;
}

function Img({ src, alt = "" }: { src?: string; alt?: string }) {
  if (!src || !publicFileExists(src)) return <Placeholder className="my-8 aspect-video" label={alt || "Image"} />;
  return (
    <span className="relative my-8 block aspect-video">
      <Image src={src} alt={alt} fill sizes="(min-width:768px) 720px, 100vw" className="object-cover" />
    </span>
  );
}

export const mdxComponents = { Gallery, YouTube, FacebookVideo, img: Img };
