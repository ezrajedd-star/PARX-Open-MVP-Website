/** Run `npm run validate` to check every /content file without a full build. */
import { getArticles, getCompete, getHost, getStageClockConfig, getDrivers, getLegs, getMerch, getPoints, getResultsFiles, getSite, getSponsors, getSponsorship, getTeams } from "../lib/content";

try {
  getSite(); getPoints(); getSponsorship(); getCompete(); getHost(); getStageClockConfig();
  const legs = getLegs(), teams = getTeams(), drivers = getDrivers();
  const results = getResultsFiles(), sponsors = getSponsors(), merch = getMerch(), articles = getArticles();
  console.log(`✅ Content OK — ${legs.length} legs, ${teams.length} teams, ${drivers.length} drivers, ${results.length} results file(s), ${sponsors.length} sponsors, ${merch.length} merch items, ${articles.length} articles.`);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
