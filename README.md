# PARX Open — website (MVP)

Official website for **PARX Open — Pilipinas Archipelago RallyCross Open**: calendar, results & standings, teams & drivers, news, shop and sponsorship.

- **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4**
- Fully static (SSG), re-generated hourly on Vercel (ISR) so leg statuses stay current
- All content lives in [`/content`](content) as JSON / MDX, validated with **zod** at build time
- Mobile first: every component is designed at 375px, then scaled up

> Editors: see **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)** for how to add news, update results, add sponsors, etc.
> Results come from **Stage Clock** automatically when a leg is closed: see **[STAGE_CLOCK.md](STAGE_CLOCK.md)**.
> Before launch: work through **[PLACEHOLDERS.md](PLACEHOLDERS.md)**.

## Setup

Requirements: Node.js 20.9+ (22 recommended) and npm.

```bash
npm install
```

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for canonical links, sitemap and Open Graph. No trailing slash. |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Form endpoint for all forms (e.g. Formspree `https://formspree.io/f/xxxx`). Empty = forms open a pre-filled email instead. |
| `NEXT_PUBLIC_SPONSOR_FORM_ENDPOINT`, `NEXT_PUBLIC_DRIVER_FORM_ENDPOINT`, `NEXT_PUBLIC_HOST_FORM_ENDPOINT` | Optional separate endpoints for the sponsorship, driver registration and host-a-leg forms (fall back to `NEXT_PUBLIC_FORM_ENDPOINT`). |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta (Facebook) Pixel ID. Empty = pixel disabled. |

## Develop

```bash
npm run dev
```

Open http://localhost:3000.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run validate` | Checks every file in `/content` and prints clear errors (also runs automatically before `build`). |
| `npm test` | Unit tests for leg status (Manila time), countdown and standings maths. |
| `npm run typecheck` | TypeScript check. |
| `npm run logo` | Regenerates the placeholder wordmark `public/brand/parx-logo.svg`. |
| `npm run map` | Regenerates the coastline map data (`components/map/ph-map-data.ts`) from Natural Earth. |
| `npm run import:stage-clock -- --leg ormoc` | Imports a closed leg from Stage Clock (normally done by the GitHub Action). See STAGE_CLOCK.md. |

## Build

```bash
npm run build
```

```bash
npm start
```

A typo in a content file fails the build with a message naming the file and field, e.g.

```
❌ Content error in content/legs.json
  • legs.0.dates.start: Use the date format YYYY-MM-DD, e.g. 2027-03-12
```

## Deploy (Vercel)

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repository. The framework preset is detected as Next.js; keep the defaults (build `npm run build`, output `.next`).
3. Under **Settings → Environment Variables**, add the three variables above (at least `NEXT_PUBLIC_SITE_URL`).
4. Deploy. Every push to the production branch redeploys; pull requests get preview URLs.
5. Add the custom domain under **Settings → Domains** and update `NEXT_PUBLIC_SITE_URL` to match.

Content edits made directly on GitHub (e.g. a new results file) trigger a redeploy automatically.

## Project structure

```
app/                     Routes (App Router)
  page.tsx               Home
  news/ [slug]/          News index + MDX article (with OG image)
  calendar/ [leg]/       Calendar + leg pages
  results/ teams/ [leg]/ Driver standings, team standings, per-leg results (with podium OG image)
  teams/ [team]/         Teams index + team pages
  drivers/[driver]/      Driver pages
  shop/ sponsorship/
  drive/                 Join as a Driver (Rally Fundamentals, Arrive and Drive, own car) + registration form
  host/                  "Want us in your city? Let's talk." + host-city form
  api/legs.json/         Public leg list (used by Stage Clock's close-leg dialog)
  sitemap.ts robots.ts opengraph-image.tsx
components/
  layout/                Header, Ticker (next race / LIVE), Footer, Countdown, leg-status provider, Meta Pixel
  ui/                    Buttons, section headings, icons, branded placeholders, Photo
  sponsors/              Tier-aware sponsor wall (footer, Home, leg pages, Sponsorship)
  forms/LeadForm.tsx     Shared form (sponsor, driver, host): validation, endpoint POST, mailto fallback
  map/                   Coastline map of the Visayas & Northern Mindanao with host cities
  cta/                   "Join as a driver" and "Host a leg" bands
  calendar/ results/ news/ teams/ sponsorship/ shop/ home/
content/                 ← all editable content (see CONTENT_GUIDE.md)
lib/
  types.ts               zod schemas + TypeScript types (Site, Leg, Team, Driver, Result, PointsTable, Sponsor, Article, MerchItem)
  content.ts             Loads + validates + cross-checks /content
  status.ts              Leg status & countdown in Asia/Manila time (+ tests)
  standings.ts           Points, classification, driver & team standings (+ tests)
  stage-clock/           Stage Clock import: vendored timing maths + mapping to PARX results (+ tests)
  seo.tsx og.tsx format.ts data.ts
public/
  brand/parx-logo.svg    Placeholder wordmark — replace this one file with the final logo
  images/{drivers,cars,teams,legs,news,sponsors,merch}/
  docs/parx-open-sponsor-deck.pdf (placeholder)
assets/fonts/            Fonts used by generated Open Graph images
```

## How key features work

- **Live timing & results**: Stage Clock runs live timing on a subdomain (`live.<domain>`). When the admin closes a leg there, a GitHub Action imports the final results into `content/results/`, and Vercel republishes within about 2 minutes. See STAGE_CLOCK.md.

- **Leg status** (Upcoming / Next / Live / Completed) is computed from each leg's dates in **Asia/Manila** time, at build time *and* again in the browser every 30 s, so a cached page never shows a stale state. `statusOverride` in `content/legs.json` always wins. Legs with `"dates": null` show "Dates TBA" and can still be "Next".
- **Countdown** targets 00:00 Manila time on the leg's start date. During a race weekend the ticker under the header turns red (**LIVE**) and links to the leg page.
- **Standings** are calculated at build time from `content/results/*.json` and `content/points.json`. No totals are typed by hand. Ties use countback. Team score per leg = best *N* drivers (`teamScoringDrivers`).
- **Photos** follow one convention: `public/images/drivers/{slug}.jpg` and `public/images/cars/{slug}.jpg`. If the file exists it is used; otherwise a branded placeholder renders.
- **Sponsors** are ordered and sized by tier everywhere (Title → Gold → Silver → Bronze → Local Partners).
- **SEO**: per-page metadata, Open Graph + Twitter cards, generated OG images for articles and leg results (podium), `sitemap.xml`, `robots.txt`, JSON-LD (`SportsOrganization`, `SportsEvent`, `SportsTeam`, `NewsArticle`, `Person`).

## Quality checks (at hand-over)

- `npm run build`: clean, 77 static pages
- `npm test`: 25 tests passing
- Lighthouse mobile (production build, simulated throttling):
  - Home: Performance 97–99 · Accessibility 100 · Best Practices 100 · SEO 100
  - Results: Performance 99–100 · Accessibility 100 · Best Practices 100 · SEO 100
