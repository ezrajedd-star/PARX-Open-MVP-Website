/**
 * Content schemas. Every file in /content is parsed with these zod schemas at
 * build time — a typo fails the build with a message naming the file and field.
 */
import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD, e.g. 2027-03-12");
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs use lowercase letters, numbers and dashes only");
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #C8102E");
const publicPath = z.string().startsWith("/", "Image paths must start with / (relative to /public)");

/* ----------------------------------------------------------------- Site */
export const SocialPlatform = z.enum(["facebook", "youtube", "instagram", "tiktok", "x"]);
export const SiteSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  fullName: z.string().min(1),
  season: z.number().int(),
  tagline: z.string(),
  /** Home hero media. null = branded placeholder graphic. */
  hero: z.object({ image: publicPath.nullable(), video: publicPath.nullable(), poster: publicPath.nullable() }),
  description: z.string(),
  logo: publicPath,
  logoAlt: z.string(),
  contactEmail: z.string().email(),
  sponsorshipEmail: z.string().email(),
  accreditation: z.string(),
  sponsorDeck: publicPath.nullable(),
  timezone: z.literal("Asia/Manila"),
  social: z.array(z.object({ platform: SocialPlatform, label: z.string(), url: z.string().url() })),
  facebookPageName: z.string(),
  socialPosts: z.array(
    z.object({
      text: z.string(),
      date: isoDate.nullable(),
      url: z.string().url().nullable(),
      image: publicPath.nullable(),
      sample: z.boolean().default(false),
    }),
  ),
  stats: z.array(z.object({ label: z.string(), value: z.string().nullable() })),
  nav: z.array(z.object({ label: z.string(), href: z.string() })),
});
export type Site = z.infer<typeof SiteSchema>;

/* ----------------------------------------------------------------- Legs */
export const IslandGroup = z.enum(["Visayas", "Mindanao"]);
export type IslandGroup = z.infer<typeof IslandGroup>;
export const LegStatus = z.enum(["upcoming", "next", "live", "completed"]);
export type LegStatus = z.infer<typeof LegStatus>;

export const ScheduleBlockSchema = z.object({
  day: z.string(),
  time: z.string(),
  items: z.array(z.string()).min(1),
});
export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;

export const LegSchema = z.object({
  round: z.number().int().positive(),
  slug,
  name: z.string(),
  province: z.string(),
  islandGroup: IslandGroup,
  /** null = "Dates TBA" */
  dates: z
    .object({ start: isoDate, end: isoDate })
    .refine((d) => d.start <= d.end, "dates.end must be on or after dates.start")
    .nullable(),
  venue: z.object({ name: z.string().nullable(), address: z.string().nullable() }),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    approximate: z.boolean().default(false),
  }),
  /** Force a status regardless of dates (e.g. postponed event, or results confirmed early). */
  statusOverride: LegStatus.nullable(),
  /** null = use the standard weekend schedule from legs.json → defaultSchedule */
  schedule: z.array(ScheduleBlockSchema).nullable(),
  heroImage: publicPath.nullable(),
  gallery: z.array(z.object({ src: publicPath, alt: z.string() })),
  spectatorInfo: z
    .object({
      gettingThere: z.string().nullable(),
      food: z.string().nullable(),
      parking: z.string().nullable(),
    })
    .nullable(),
});
export type Leg = z.infer<typeof LegSchema> & { schedule: ScheduleBlock[] };

export const LegsFileSchema = z.object({
  defaultSchedule: z.array(ScheduleBlockSchema),
  legs: z.array(LegSchema),
});

/* ---------------------------------------------------------- Teams/Drivers */
export const DriverSchema = z.object({
  slug,
  displayName: z.string().min(1),
  surname: z.string().nullable(),
  car: z.string().nullable(),
  number: z.number().int().nullable(),
  hometown: z.string().nullable(),
  class: z.string().nullable().optional(),
});
export type DriverInput = z.infer<typeof DriverSchema>;

export const TeamSchema = z.object({
  slug,
  name: z.string(),
  principal: z.string().nullable(),
  principalDriverSlug: slug.nullable(),
  colors: z.object({ primary: hexColor, secondary: hexColor }),
  logo: publicPath.nullable(),
  heroImage: publicPath.nullable(),
  independent: z.boolean(),
  sponsors: z.array(z.object({ name: z.string(), url: z.string().url().nullable() })),
  drivers: z.array(DriverSchema),
});
export type Team = z.infer<typeof TeamSchema>;
export const TeamsFileSchema = z.object({ note: z.string().optional(), teams: z.array(TeamSchema) });

export type Driver = DriverInput & {
  teamSlug: string;
  teamName: string;
  independent: boolean;
  isPrincipal: boolean;
};

/* ---------------------------------------------------------------- Results */
const stageTime = z
  .string()
  .regex(/^(\d+:)?\d{1,2}\.\d{1,3}$|^\d+:\d{2}(\.\d{1,3})?$/, "Stage times look like 1:02.345")
  .nullable();
export const ResultStatus = z.enum(["FIN", "DNF", "DNS", "DSQ"]);
export type ResultStatus = z.infer<typeof ResultStatus>;

export const ResultSchema = z.object({
  driverSlug: slug,
  /** Official classified position. Must be null for DNF/DNS/DSQ. */
  position: z.number().int().positive().nullable(),
  status: ResultStatus,
  stageTimes: z.array(stageTime).length(8, "Provide exactly 8 stage times (use null for missing)"),
  /** Optional — when null the total is the sum of the stage times. */
  totalTime: stageTime.optional(),
  class: z.string().nullable().optional(),
});
export type ResultInput = z.infer<typeof ResultSchema>;
export type Result = ResultInput & { legSlug: string };

export const ResultsFileSchema = z.object({
  legSlug: slug,
  sample: z.boolean().default(false),
  note: z.string().optional(),
  entries: z.array(ResultSchema),
});
export type ResultsFile = z.infer<typeof ResultsFileSchema>;

/* ----------------------------------------------------------------- Points */
export const PointsTableSchema = z.object({
  note: z.string().optional(),
  positions: z.array(z.number().nonnegative()),
  statusPoints: z.object({ DNF: z.number(), DNS: z.number(), DSQ: z.number() }),
  /** How many of a team's best-placed drivers score team points per leg. null = all drivers. */
  teamScoringDrivers: z.number().int().positive().nullable(),
});
export type PointsTable = z.infer<typeof PointsTableSchema>;

/* --------------------------------------------------------------- Sponsors */
export const SponsorTier = z.enum(["title", "gold", "silver", "bronze", "local"]);
export type SponsorTier = z.infer<typeof SponsorTier>;
export const SponsorSchema = z.object({
  name: z.string(),
  tier: SponsorTier,
  logo: publicPath.nullable(),
  url: z.string().url().nullable(),
  legs: z.union([z.literal("season"), z.array(slug).min(1)]),
  sample: z.boolean().default(false),
});
export type Sponsor = z.infer<typeof SponsorSchema>;
export const SponsorsFileSchema = z.object({ note: z.string().optional(), sponsors: z.array(SponsorSchema) });

export const SponsorshipSchema = z.object({
  hero: z.object({ title: z.string(), subtitle: z.string() }),
  footprint: z.string(),
  contentMachine: z.array(z.object({ title: z.string(), text: z.string() })),
  tiers: z.array(
    z.object({
      id: SponsorTier,
      name: z.string(),
      pricePerLeg: z.number().nullable(),
      priceLabel: z.string().nullable(),
      highlight: z.boolean(),
      summary: z.string(),
    }),
  ),
  benefitsNote: z.string(),
  benefits: z.array(
    z.object({
      label: z.string(),
      values: z.record(SponsorTier, z.union([z.boolean(), z.string()])),
    }),
  ),
  seasonBundle: z.object({ title: z.string(), text: z.string(), discountPercent: z.number().nullable() }),
  otherWays: z.array(z.object({ title: z.string(), text: z.string() })),
});
export type Sponsorship = z.infer<typeof SponsorshipSchema>;

/* ------------------------------------------------------------------- News */
export const ArticleCategory = z.enum([
  "Race Report",
  "Announcement",
  "Driver Feature",
  "Partner News",
  "Behind the Scenes",
]);
export type ArticleCategory = z.infer<typeof ArticleCategory>;
export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: isoDate,
  author: z.string(),
  category: ArticleCategory,
  image: publicPath.nullable().default(null),
  imageAlt: z.string().default(""),
  featured: z.boolean().default(false),
  sample: z.boolean().default(false),
  legSlug: slug.nullable().default(null),
});
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;
export type Article = ArticleFrontmatter & { slug: string; body: string; readMinutes: number };

/* ------------------------------------------------------------------ Merch */
export const MerchItemSchema = z.object({
  slug,
  name: z.string(),
  price: z.number().nullable(),
  image: publicPath.nullable(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  badge: z.enum(["only-at-venues", "limited-per-leg"]),
  legSlug: slug.nullable(),
  description: z.string(),
  comingSoon: z.boolean().default(false),
});
export type MerchItem = z.infer<typeof MerchItemSchema>;
export const MerchFileSchema = z.object({ note: z.string().optional(), items: z.array(MerchItemSchema) });

/* --------------------------------------------------------- Join as a driver */
export const CompeteSchema = z.object({
  hero: z.object({ eyebrow: z.string(), title: z.string(), subtitle: z.string() }),
  paths: z
    .array(
      z.object({
        id: slug,
        name: z.string(),
        tag: z.string(),
        summary: z.string(),
        points: z.array(z.string()),
        price: z.number().nullable(),
        motto: z.string().nullable(),
        cta: z.string(),
      }),
    )
    .min(1),
  instructor: z.object({ name: z.string(), title: z.string(), photo: publicPath.nullable() }),
  steps: z.array(z.object({ title: z.string(), text: z.string() })),
  packageNote: z.string(),
});
export type Compete = z.infer<typeof CompeteSchema>;

/* -------------------------------------------------------------- Host a leg */
export const HostSchema = z.object({
  hero: z.object({ eyebrow: z.string(), title: z.string(), subtitle: z.string() }),
  benefits: z.array(z.object({ title: z.string(), text: z.string() })),
  lookingFor: z.array(z.string()),
});
export type Host = z.infer<typeof HostSchema>;
