/** Public, static list of legs — used by Stage Clock's "Close leg & publish" dialog. */
import { getLegsWithStatus } from "@/lib/data";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const legs = getLegsWithStatus().map((l) => ({ slug: l.slug, round: l.round, name: l.name, province: l.province, dates: l.dates, status: l.status, hasResults: l.hasResults }));
  return Response.json({ legs }, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } });
}
