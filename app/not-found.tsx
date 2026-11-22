import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="dust-texture relative overflow-hidden bg-navy py-24 text-white">
      <div className="speed-lines absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <p className="eyebrow text-gold">Error 404</p>
        <h1 className="heading mt-3 text-6xl md:text-8xl">Off the track.</h1>
        <p className="mt-4 max-w-md text-white/80">We couldn&apos;t find that page. It may have moved, or the link might be wrong.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/" variant="light" arrow>Back to home</LinkButton>
          <LinkButton href="/calendar" variant="ghost-light">See the calendar</LinkButton>
        </div>
      </div>
    </section>
  );
}
