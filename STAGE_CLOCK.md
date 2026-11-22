# Stage Clock ↔ PARX Open

[Stage Clock](https://github.com/ezrajedd-star/stage-clock) is the live timing app. The PARX Open website is the permanent home of results and standings. Together they run on **one domain**:

| Address | What it serves |
| --- | --- |
| `parxopen.com` (example) | This website (Vercel project: PARX Open) |
| `live.parxopen.com` | Stage Clock live timing (Vercel project: Stage Clock) |

A subdomain is part of the domain you already own, so there's nothing extra to buy. It also keeps the two apps independent: Stage Clock's sign-in, offline app (PWA) and API keep working exactly as they do today. Serving it under a path (`parxopen.com/live`) would mean rebuilding Stage Clock for a sub-path, so the subdomain is recommended.

## How results flow

```
Race weekend                 Leg over                                  ~2 minutes later
────────────                 ────────                                  ────────────────
Stage Clock (live board) ──► Admin: "Close leg & publish to PARX Open"
                             • choose the PARX leg, review pre-flight check
                             • Stage Clock locks the board (closedAt, parxLegSlug)
                             • api/close-leg → GitHub repository_dispatch
                                              │
                                              ▼
                             PARX repo: GitHub Action "Import results from Stage Clock"
                             • reads final results from Firestore (public read)
                             • npm run import:stage-clock → content/results/{leg}.json
                             • validates all content + runs tests
                             • commits to the default branch ──────────► Vercel redeploys
                                                                         Results, standings,
                                                                         driver pages updated
```

While a leg is **live**, the bar under the PARX menu turns red and links to Stage Clock ("Live timing"). The leg page also shows a Live timing button. The URL lives in `content/site.json → liveTiming.url`.

## What the importer does (`lib/stage-clock/map.ts`)

- **Same maths as the board.** Times, penalties, DNF/DNS substitutes (slowest time + DNF penalty) and dropped runs are calculated with a verbatim copy of Stage Clock's `standings.ts` (`lib/stage-clock/vendor.ts`), so totals match the board to the millisecond.
- **Hidden rows are skipped.** Stage Clock's "hide" is used for test entries and duplicates as well as disqualifications. A real DSQ can be set by hand in the results file afterwards (`"status": "DSQ", "position": null`).
- **Incomplete entries aren't classified.** A crew missing a time on a stage that others ran is imported as **DNF** (0 points) with a warning. Otherwise their total would be too low and they'd top the table. Stage Clock's close dialog lists these crews so the operator can enter DNF/DNS first.
- **Ranking.** Classified entries are ranked overall by total time (PARX points are overall). Each entry also keeps its **class** and **class position**, and the leg results page has class filter chips.
- **Matching drivers.** A Stage Clock driver name is matched to a PARX driver in this order:
  1. An alias in `content/stage-clock.json`
  2. The display name or slug, ignoring case and punctuation (`PAUlo` → paulo, `Ian A.` → ian-a)
  3. A unique car number
- **New drivers are added automatically.** A name that matches nobody becomes a new driver in the **Independent Drivers** team, and the import summary lists them. If it's really an existing driver, add an alias and run the import again. If they joined a team, move them in `teams.json`.
- **Empty profile fields are filled.** Car and car number are copied to the driver's profile only where PARX has nothing yet.
- **Guards.** The import stops if:
  - Stage Clock has no visible entries (for example, the event was already reset)
  - two visible rows map to one driver
  - Stage Clock was closed for a different leg (override with `--force`)

Every import also saves the raw Stage Clock data in `content/results/raw/{leg}.stage-clock.json` for audit.

## One-time setup

1. **Production branch.** This repo's default branch is currently `claude/focused-lamport-2vt1ei` because the repo started empty. Merge it into `main`, then set `main` as the default branch (GitHub → Settings → General) and as the Vercel production branch. The import workflow runs on and commits to the default branch.
2. **Allow the workflow to push.** GitHub → this repo → Settings → Actions → General → Workflow permissions: **Read and write**. If `main` is protected, allow GitHub Actions to push to it, or the import fails at "Commit and push".
3. **GitHub token for Stage Clock.** Create a fine-grained personal access token:
   - Repository access: **only this repo**
   - Permissions: **Contents: Read and write**

   This is the minimum GitHub accepts for repository dispatch.
4. **Stage Clock environment** (Vercel → Stage Clock project → Settings → Environment Variables):
   - `PARX_GITHUB_TOKEN`: the token from step 3
   - `VITE_PARX_SITE_URL`: e.g. `https://parxopen.com`
   - `PARX_GITHUB_REPO`: only if this repo is renamed

   Redeploy after adding them.
5. **Merge the Stage Clock change.** The "Close leg & publish" feature is on the Stage Clock branch `feature/parx-close-leg` (not merged). Merging it to Stage Clock's `main` deploys it.
6. **Domain.**
   1. Add `parxopen.com` to the PARX Vercel project and `live.parxopen.com` to the Stage Clock project.
   2. Add `live.parxopen.com` to Firebase → Authentication → Settings → **Authorized domains**, so Google sign-in keeps working.
   3. Set `content/site.json → liveTiming.url` to `https://live.parxopen.com`.

## Running an import by hand

From GitHub: **Actions → Import results from Stage Clock → Run workflow**, then enter the leg slug.

Locally:

```bash
npm run import:stage-clock -- --leg ormoc --dry-run
```

```bash
npm run import:stage-clock -- --leg ormoc
```

If Stage Clock was already reset, use the backup file that its **Reset event data** dialog downloads:

```bash
npm run import:stage-clock -- --leg ormoc --from ~/Downloads/stage_clock_backup_2027-03-14.json
```

Then commit and push the changed files in `content/`.

## Things to confirm

- **Aliases.** `content/stage-clock.json` maps `C. VIP` → vip, `VM Toto` → toto, `Raprap` → raphael and `Zoylo` → zoilo. These were inferred from names seen in Stage Clock, so please confirm or correct them.
- **Points basis.** Stage Clock events run in classes (GROUP 1–4, AWD, LADIES), but PARX points are currently overall. If the championship should be scored per class, that changes `content/points.json` and the standings pages.
- **Timing-rule changes.** If Stage Clock's calculation changes, re-copy `src/lib/standings.ts` and the Firestore decoders into `lib/stage-clock/vendor.ts`.
