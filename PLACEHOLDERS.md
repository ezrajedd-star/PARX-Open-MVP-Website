# Placeholder checklist: real content needed before launch

Everything below is currently a placeholder, sample or TBA. Nothing on the site invents real-world facts: missing data shows as **TBA**, **Dates TBA**, **Sample data** or a labelled placeholder graphic.

## Brand & site settings: `content/site.json`, `public/`
- [ ] **Final logo**: replace `public/brand/parx-logo.svg` (currently a generated text wordmark). Use a light version for navy backgrounds.
- [ ] Favicon: `public/icon.svg` (simple "P" mark)
- [ ] `contactEmail` and `sponsorshipEmail`: currently `partners@parx-open.example` (not a real inbox)
- [ ] `accreditation`: "Organised under …" (blank)
- [ ] Social URLs: Facebook, YouTube, Instagram and TikTok all point to the platform home pages. Add the real page URLs, and remove any platform you don't use.
- [ ] `facebookPageName`
- [ ] `socialPosts`: 3 sample cards on Home. Replace them with real posts (text, date, url).
- [ ] `hero.image` / `hero.video`: the Home hero is a placeholder graphic of a car mid-drift in dust
- [ ] Series name / tagline: confirm (the name may change; edit only `site.json`)

## Audience stats: `content/site.json → stats`
- [ ] Facebook followers: TBA
- [ ] Monthly reach: TBA
- [ ] Video views: TBA
- [ ] Spectators per leg: TBA
- [x] Drivers on the grid: 37 (from the team list)

## Calendar: `content/legs.json`
- [ ] **Dates for all 5 legs** (currently `null` → "Dates TBA"; the countdown starts once set)
- [ ] Venue names (currently "Venue TBA")
- [ ] Exact venue coordinates (currently approximate city/province centres, labelled "Approximate location")
- [ ] Spectator info per leg: getting there, food vendors, parking (placeholder text shown)
- [ ] Leg hero images and post-race galleries
- [ ] Confirm the standard weekend schedule, or set per-leg schedules with times

## Results & points
- [ ] **Delete `content/results/ormoc.json`**: fictional SAMPLE results that drive the demo standings on Home, Results, team and driver pages
- [ ] **Points table**: `content/points.json` uses the placeholder 25-18-15-12-10-8-6-4-2-1
- [ ] Team scoring rule: `teamScoringDrivers: 2` (placeholder; best 2 drivers per team per leg)
- [ ] DNF/DNS/DSQ points (currently 0)
- [ ] Classes, if any (the optional `class` field is supported)

## Teams & drivers: `content/teams.json`, `public/images/`
- [ ] **Team colours**: placeholder design choices for all 6 teams
- [ ] Team logos (6), shown as initials placeholders
- [ ] Team hero car photos (6)
- [ ] Team sponsors (6, all empty)
- [ ] For all 37 drivers: surname, car make & model, car number, hometown (all `null` → TBA)
- [ ] **Driver headshots (37)**: `public/images/drivers/{slug}.jpg`
- [ ] **Car photos (37)**: `public/images/cars/{slug}.jpg`

## News: `content/news/`
- [ ] Replace or delete the 3 **sample articles** (launch announcement, "Meet the teams", sponsorship call), all marked "Sample article"
- [ ] Article hero images (all placeholders)
- [ ] The "Meet the teams" sample contains a placeholder video slot (`<YouTube id="PLACEHOLDER" />`)

## Sponsorship: `content/sponsorship.json`, `content/sponsors.json`
- [ ] **Delete all 14 sample sponsors** in `sponsors.json` (shown as "SAMPLE LOGO" tiles in the footer, Home, leg pages and Sponsorship)
- [ ] Real sponsor logos and URLs, with tier and legs
- [ ] **Benefits matrix**: every value is a placeholder (many "TBA"); organisers to finalise
- [ ] Season bundle discount (`discountPercent: null` → "Season discount: TBA")
- [ ] Confirm tier prices (₱100,000 / ₱50,000 / ₱30,000 / ₱15,000 / in-kind, as briefed)
- [ ] **Sponsor deck PDF**: `public/docs/parx-open-sponsor-deck.pdf` is a one-page placeholder
- [ ] Hero and footprint copy review

## Shop: `content/merch.json`
- [ ] Prices for all items (`null` → "Price TBA")
- [ ] Product photos (`public/images/merch/{slug}.jpg`)
- [ ] Confirm sizes and colours
- [ ] Leg Edition designs for rounds 2–5 (shown as "Design reveal coming soon")
- [ ] Payment methods at the venue (copy says "to be confirmed per venue")

## Join as a Driver: `content/compete.json`
- [ ] Prices and newcomer package details for each path ("Package details: TBA")
- [ ] Entry requirements (licence, safety gear, minimum age): currently only "to be confirmed"
- [ ] Instructor photo of Vip Isada (`compete.json → instructor.photo`). Also confirm whether he is the "Vip" in the Independent drivers list, so the pages can link.
- [ ] Rally Fundamentals time on Friday ("Time TBA" in the standard schedule)

## Host a Leg: `content/host.json`
- [ ] Review the benefits and "What we look for" copy

## Stage Clock: see STAGE_CLOCK.md → One-time setup
- [ ] Make `main` the default/production branch and allow Actions to push
- [ ] `PARX_GITHUB_TOKEN` and `VITE_PARX_SITE_URL` on the Stage Clock Vercel project
- [ ] Merge Stage Clock branch `feature/parx-close-leg`
- [ ] `live.<domain>` subdomain + Firebase authorized domain; update `site.json → liveTiming.url`
- [ ] Confirm the inferred name aliases in `content/stage-clock.json`
- [ ] Decide whether points are overall (current) or per class

## Environment variables (Vercel)
- [ ] `NEXT_PUBLIC_SITE_URL`: production domain
- [ ] `NEXT_PUBLIC_FORM_ENDPOINT`: Formspree (or similar) endpoint; until then the forms fall back to `mailto:`. Optionally set separate `NEXT_PUBLIC_{SPONSOR,DRIVER,HOST}_FORM_ENDPOINT`.
- [ ] `NEXT_PUBLIC_META_PIXEL_ID`: Meta Pixel (disabled while empty)
