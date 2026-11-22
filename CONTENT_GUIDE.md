# Content guide

Everything on the site comes from files in the **`/content`** folder. You don't need to touch any code.

**The easiest way to edit:** open the file on GitHub, click the ✏️ pencil icon, make the change, then click **Commit changes**. Vercel rebuilds the site automatically. It's live in about 1–2 minutes.

If you make a mistake, such as a missing comma or a wrong date format, the build stops and the live site stays as it was. The error message tells you exactly which file and line to fix, for example:

```
❌ Content error in content/legs.json
  • legs.0.dates.start: Use the date format YYYY-MM-DD, e.g. 2027-03-12
```

### JSON tips

- Text goes in "double quotes". Numbers don't: `"price": 450`.
- Every item in a list is separated by a comma, but there's **no comma after the last one**.
- `null` means "not known yet". The site shows **TBA** or a placeholder.
- Dates are always `YYYY-MM-DD`, e.g. `2027-03-12`.

---

## Quick reference

| I want to… | Edit this file |
| --- | --- |
| Change the series name, tagline, email, social links or audience stats | `content/site.json` |
| Set a leg's dates, venue, schedule or spectator info | `content/legs.json` |
| Add or edit teams and drivers | `content/teams.json` |
| Publish race results | `content/results/{leg-slug}.json` |
| Change the points system | `content/points.json` |
| Add or remove sponsors | `content/sponsors.json` |
| Change sponsorship packages, prices or benefits | `content/sponsorship.json` |
| Add or edit merch | `content/merch.json` |
| Write a news post | `content/news/{slug}.mdx` |
| Add photos | `public/images/...` (see below) |

---

## Write a news post

1. In `content/news/`, create a new file named after the web address you want, e.g. `ormoc-race-report.mdx` (lowercase, dashes, no spaces). It will appear at `/news/ormoc-race-report`.
2. Copy this template:

```mdx
---
title: "Boodie takes Ormoc in a last-stage thriller"
excerpt: "One or two sentences shown on news cards and in Facebook previews."
date: "2027-03-15"
author: "PARX Open Media"
category: "Race Report"
image: "/images/news/ormoc-race-report.jpg"
imageAlt: "Describe the photo for visually impaired readers"
featured: false
---

Your article text. Separate paragraphs with a blank line.

## A subheading

- A bullet point
- Another bullet point

**Bold text** and [a link](/results/ormoc).
```

- **category** must be exactly one of: `Race Report`, `Announcement`, `Driver Feature`, `Partner News`, `Behind the Scenes`.
- **featured: true** puts the article in the big slot at the top of News and on Home. Only one article should be featured.
- **image** is optional. Use `null` for a branded placeholder.
- The read time and the Facebook share image are generated automatically.

**Extras you can use inside an article:**

```mdx
<Gallery images={[
  { src: "/images/news/ormoc-1.jpg", alt: "Start line" },
  { src: "/images/news/ormoc-2.jpg", alt: "Podium", caption: "The top three" }
]} />

<YouTube id="dQw4w9WgXcQ" title="Ormoc highlights" />

<FacebookVideo href="https://www.facebook.com/parxopen/videos/123456789" title="Live replay" />
```

For YouTube, the `id` is the part after `v=` in the video's address.

**Remove the sample articles** (`introducing-parx-open.mdx`, `meet-the-teams.mdx`, `partner-with-parx-open.mdx`) before launch, or edit them and delete the `sample: true` line.

---

## Set leg dates and details: `content/legs.json`

Each leg looks like this:

```json
{
  "round": 1,
  "slug": "ormoc",
  "name": "Ormoc",
  "province": "Leyte",
  "islandGroup": "Visayas",
  "dates": { "start": "2027-03-12", "end": "2027-03-14" },
  "venue": { "name": "Ormoc City Superdome grounds", "address": "Ormoc City, Leyte" },
  "coordinates": { "lat": 11.0064, "lng": 124.6075, "approximate": false },
  "statusOverride": null,
  "schedule": null,
  "heroImage": "/images/legs/ormoc.jpg",
  "gallery": [{ "src": "/images/legs/ormoc-gallery-1.jpg", "alt": "Car sliding at turn 3" }],
  "spectatorInfo": {
    "gettingThere": "…",
    "food": "…",
    "parking": "…"
  }
}
```

(The venue name above is just an example.)

- **dates**: `null` shows "Dates TBA". Once set, the countdown and statuses work automatically in Philippine time:
  - **Next**: the first leg that hasn't happened yet
  - **Live**: from 00:00 on the start date to the end of the end date. The bar under the menu turns red and says LIVE.
  - **Completed**: after the end date
- **statusOverride**: leave as `null`. Only set it to `"upcoming"`, `"next"`, `"live"` or `"completed"` to force a status, e.g. if a leg is postponed.
- **coordinates**: drives the Google Map. Right-click the venue in Google Maps to copy its coordinates. Set `"approximate": false` once it's the real venue.
- **schedule**: `null` uses the standard weekend schedule at the top of the file (`defaultSchedule`). To customise one leg, replace `null` with a list in the same format as `defaultSchedule`.
- **spectatorInfo**: `null` shows placeholder text.

---

## Publish results: `content/results/{leg-slug}.json`

Create one file per leg, named after the leg's slug, e.g. `content/results/tabogon.json`:

```json
{
  "legSlug": "tabogon",
  "entries": [
    { "driverSlug": "jong",  "position": 1,    "status": "FIN", "stageTimes": ["1:02.345", "1:01.998", "1:03.120", "1:02.500", "1:02.010", "1:01.870", "1:02.640", "1:02.200"] },
    { "driverSlug": "paulo", "position": 2,    "status": "FIN", "stageTimes": ["1:02.900", "1:02.110", "1:03.400", "1:02.880", "1:02.300", "1:02.050", "1:02.900", "1:02.410"] },
    { "driverSlug": "kim",   "position": null, "status": "DNF", "stageTimes": ["1:03.100", "1:02.700", null, null, null, null, null, null] },
    { "driverSlug": "ivan",  "position": null, "status": "DNS", "stageTimes": [null, null, null, null, null, null, null, null] }
  ]
}
```

- **driverSlug** is the driver's slug from `teams.json`.
- **status** is one of `FIN` (finished), `DNF` (did not finish), `DNS` (did not start) or `DSQ` (disqualified).
- **position** is the official finishing position for `FIN`, and `null` for everyone else. Positions must run 1, 2, 3… with no gaps.
- **stageTimes** are always 8 values, SS1 to SS8, written as `minutes:seconds.thousandths`. Use `null` for a stage not run.
- **totalTime** (optional): add `"totalTime": "8:25.934"` to override the total. Otherwise it's the sum of the stage times.
- **class** (optional): add `"class": "4WD"` if classes are introduced.

That's it. **Points, gaps, driver standings, team standings, movement arrows and the podium share image are all calculated automatically.** Never type totals in by hand.

`content/results/ormoc.json` is **sample data**. Replace it with the real Round 1 results and delete the `"sample": true` line, or delete the file entirely before Round 1.

---

## Points system: `content/points.json`

```json
{
  "positions": [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
  "statusPoints": { "DNF": 0, "DNS": 0, "DSQ": 0 },
  "teamScoringDrivers": 2
}
```

- **positions**: points for P1, P2, P3… Add or remove numbers to change how many positions score.
- **teamScoringDrivers**: how many of a team's best-placed drivers count towards the team score at each leg. Use `null` to count every driver.

Standings recalculate on the next build.

---

## Teams and drivers: `content/teams.json`

```json
{
  "slug": "team-ormoc",
  "name": "Team Ormoc",
  "principal": "Toto Locsin",
  "principalDriverSlug": "toto",
  "colors": { "primary": "#C8102E", "secondary": "#FFFFFF" },
  "logo": "/images/teams/team-ormoc.png",
  "heroImage": "/images/teams/team-ormoc-car.jpg",
  "independent": false,
  "sponsors": [{ "name": "Example Hardware", "url": "https://example.com" }],
  "drivers": [
    { "slug": "toto", "displayName": "Toto", "surname": null, "car": "Car make & model", "number": 7, "hometown": "Ormoc City", "class": null }
  ]
}
```

(The sponsor, car and number above are examples.)

- **Slugs must be unique** across all drivers. If two drivers share a name, add a letter, e.g. `ian-m` and `ian-a`. A slug becomes the web address `/drivers/ian-m`. Changing it later breaks old links, so pick it once.
- Unknown details stay `null` and show as **TBA**.
- Independent drivers go in the team with `"independent": true`. It always appears last.

---

## Photos

Upload photos to the `public/images/` folders on GitHub (**Add file → Upload files**).

| Photo | Where to put it | Notes |
| --- | --- | --- |
| Driver headshot | `public/images/drivers/{driver-slug}.jpg` | e.g. `ian-m.jpg`. Portrait, about 800×1000 px |
| Driver's car | `public/images/cars/{driver-slug}.jpg` | Landscape, about 1600×900 px |
| Team logo | anywhere in `public/images/teams/`, then set `"logo"` in teams.json | Square PNG/SVG |
| Leg hero / gallery | `public/images/legs/`, then set `heroImage` / `gallery` in legs.json | Landscape |
| News | `public/images/news/`, then set `image:` in the article | Landscape 1600×900 |
| Sponsor logo | `public/images/sponsors/`, then set `"logo"` in sponsors.json | Transparent PNG or SVG |
| Merch | `public/images/merch/{item-slug}.jpg`, or set `"image"` in merch.json | Square |
| Home hero | `public/images/...`, then set `hero.image` (or `hero.video` for an .mp4) in site.json | Wide, at least 2000 px |

Driver and car photos are picked up automatically: just upload with the right file name. Until then, a branded placeholder silhouette is shown. Keep files under about 500 KB. The site automatically resizes and converts them to modern formats.

---

## Sponsors: `content/sponsors.json`

```json
{ "name": "Example Telco", "tier": "gold", "logo": "/images/sponsors/example-telco.png", "url": "https://example.com", "legs": "season" }
```

- **tier**: `title`, `gold`, `silver`, `bronze` or `local`. This controls logo size and position on every page.
- **legs**: `"season"` shows the sponsor everywhere. A list such as `["ormoc", "tabogon"]` shows them only on those leg pages, plus the footer and Sponsorship page.
- **logo**: `null` shows a text tile with the sponsor's name.

**All current entries are samples.** Delete them all before launch.

## Sponsorship packages: `content/sponsorship.json`

Edit tier prices (`pricePerLeg`), the benefits matrix (`true` = ✓, `false` = —, or any short text), the season bundle discount (`discountPercent`) and the page copy. The benefits are placeholders until the organisers confirm them.

The downloadable sponsor deck is `public/docs/parx-open-sponsor-deck.pdf`. Upload a new PDF with the same name to replace it.

## Site settings: `content/site.json`

- **name / fullName / tagline**: change the series name everywhere in one place.
- **logo**: the logo file. To swap the logo, replace `public/brand/parx-logo.svg` with the final file (same name). The logo appears on a navy background, so use a light/white version.
- **contactEmail / sponsorshipEmail**: used in the footer and by the inquiry form fallback.
- **accreditation**: e.g. "the Automobile Association Philippines". It's shown as "Organised under …". Leave it empty to hide it.
- **stats**: audience numbers on the Sponsorship page. `null` shows TBA. Only enter verified figures.
- **socialPosts**: the static "latest posts" cards on Home. Set `"sample": false` on real posts and add the post's `url`.
- **nav**: menu labels and order.

## Merch: `content/merch.json`

- **badge**: `only-at-venues` or `limited-per-leg`.
- **legSlug**: tag a product to one leg to make it a "Leg Edition". Use `null` for the core collection.
- **price**: a number in pesos, e.g. `650`. `null` shows "Price TBA".

---

## Check your changes before publishing (optional, for developers)

```bash
npm run validate
```

```bash
npm run dev
```
