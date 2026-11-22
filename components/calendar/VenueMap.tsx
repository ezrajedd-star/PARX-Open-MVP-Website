/** Lazy Google Maps embed by coordinates (no API key needed). */
export function VenueMap({ lat, lng, label, approximate }: { lat: number; lng: number; label: string; approximate: boolean }) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${approximate ? 11 : 15}&output=embed`;
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-navy ring-1 ring-navy/10 md:aspect-[16/9]">
        <iframe title={`Map of ${label}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" allowFullScreen />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        {approximate && <p className="text-ink/70">Approximate location — exact venue to be announced.</p>}
        <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-red underline underline-offset-2">
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
