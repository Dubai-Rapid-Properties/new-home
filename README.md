# Dubai Rapid Properties — Homepage Demo

A client-presentation demo of a new DRP homepage. Next.js 14 (App Router),
TypeScript, Tailwind CSS, Framer Motion, Embla Carousel.

```bash
npm install
npm run dev
```

## Editing content

Every page reads its copy, images and form steps from a typed file in [`/data`](data). No copy
is hard-coded in components. Search `/data` for `DEMO PLACEHOLDER` to find everything that
needs real content before launch.

| File | Drives |
| --- | --- |
| [`homepage.ts`](data/homepage.ts) | Homepage sections, contact details, footer, shared `searchData` |
| [`navigation.ts`](data/navigation.ts) | Header mega-menu and full-screen menu |
| [`properties.ts`](data/properties.ts) | `/properties`, `/properties/[slug]`, homepage Buy / Rent tabs |
| [`offPlan.ts`](data/offPlan.ts) | `/off-plan`, `/off-plan/[slug]`, construction tracker, homepage Off-Plan tab |
| [`areas.ts`](data/areas.ts) | `/areas`, `/areas/[slug]` |
| [`news.ts`](data/news.ts) | `/news`, `/magazine/[slug]`, homepage news carousel |
| [`leadPages.ts`](data/leadPages.ts) | `/list-your-property`, `/property-valuation`, the `LeadForm` config types |
| [`services.ts`](data/services.ts) | Holiday homes (incl. Book a Stay), property management, furnishings, DRP Furnishing (`/drp-furnishing`), fit-out |
| [`developers.ts`](data/developers.ts) | `/off-plan/developers` (Developer Network): developer logos from each developer's own site, in `/public/developers/` |
| [`ecosystem.ts`](data/ecosystem.ts) | `/ecosystem`, mortgage calculator, company formation, partner network, owner portal |
| [`company.ts`](data/company.ts) | `/about` (incl. the `#team` grid), `/careers`, `/contact` |
| [`carFleet.ts`](data/carFleet.ts) | `/ecosystem/car-fleet` |
| [`legal.ts`](data/legal.ts) | `/privacy`, `/terms` |
| [`external.ts`](data/external.ts) | `HOLIDAY_HOMES_URL` — the separate Holiday Homes website the nav, footer and tiles link out to |

**Forms.** Every enquiry form is a `LeadForm` driven by a `steps` array (choice cards, area
search, free text, contact details with optional message and checkbox). Submissions are
logged to the console; wire `submitLead` in `components/LeadForm.tsx` (marked `TODO`) to the
CRM. The contact form, Book a Stay request and owner sign-in carry their own `TODO`s.

**Search.** The hero and Section 02 search bars build query strings that `/properties` and
`/off-plan` read on load (`q` area, `type`, `beds`, `min` / `max`, `handover`), so a homepage
search lands on a filtered list. Both explorers share `components/filters/FilterExplorer.tsx`.

## Listings from the D|R|P admin portal

The site shows the Property Finder listings (`data/imported/listings.json`, kept current by
`scripts/sync-property-finder.mjs`) **and** the listings added in the admin portal
(admin.dubairapidproperties.com → Website → Listings). A portal listing with the same web address
as a Property Finder one takes its place.

Before every build, `npm run build` runs both syncs (the npm `prebuild` step): first Property
Finder, then [`scripts/sync-listings.mjs`](scripts/sync-listings.mjs), which downloads the portal's
published listings into `data/imported/portal-listings.json`. `data/properties.ts` combines the two
files; every page reads them unchanged.

| Variable (Vercel → Settings → Environment Variables) | Value |
| --- | --- |
| `LISTINGS_FEED_URL` | `https://admin.dubairapidproperties.com/api/public/listings` |
| `LISTINGS_FEED_REQUIRED` | Optional. `1` fails the build when the portal cannot be read, instead of keeping the file in the repository. |

The portal also starts a rebuild of this site whenever a published listing changes: put the same
Vercel **Deploy Hook** used by the hourly Property Finder workflow into the **portal's** Vercel
project as `WEBSITE_DEPLOY_HOOK_URL`.

Without `LISTINGS_FEED_URL`, or if the portal is unreachable, the build keeps
`portal-listings.json` from the repository (empty by default). `npm run sync:listings` refreshes it
locally. Photos uploaded in the portal are served from Supabase Storage (allowed in
`next.config.mjs`).

### Editing or hiding a Property Finder listing

In the portal (Website → Listings → **Property Finder listings**), **Edit** copies a Property Finder
listing into the portal under the same web address; the site then shows that copy, which can be
changed in the normal listing form (price, title, description, photos, agent…). **Hide** takes a
listing off the site. Property Finder itself is not touched, and an edited listing no longer follows
changes made on Property Finder. The portal reads the Property Finder list from `/pf-listings.json`,
and `scripts/sync-listings.mjs` downloads the hidden addresses into
`data/imported/hidden-listings.json` (the portal's `/api/public/listings/hidden`).

## Enquiry emails

Every form on the site (contact, enquiries, valuations, careers with CV,
holiday-home bookings) posts to `/api/enquiry`, which emails the enquiry to
**office@dubairapidproperties.com** through [Resend](https://resend.com).
Replying to the email replies to the visitor.

Set in Vercel → Environment Variables:

| Variable | |
| --- | --- |
| `RESEND_API_KEY` | Required. Resend → API Keys. Without it the forms show a "could not be sent — call or WhatsApp us" message. |
| `ENQUIRY_FROM` | Optional. Defaults to `DRP Website <onboarding@resend.dev>`, which only delivers to the Resend account's own address — so sign up to Resend with office@dubairapidproperties.com, or verify the domain in Resend and set e.g. `DRP Website <website@dubairapidproperties.com>`. |
| `ENQUIRY_TO` | Optional. Defaults to office@dubairapidproperties.com. |
| `TURNSTILE_SECRET_KEY` | Optional. Cloudflare Turnstile secret; once set, a form is only accepted with a passed bot check. Its pair, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, is a GitHub Actions variable used at build time. Without them the forms work as before. |

CVs are limited to 4 MB (PDF or Word).

## Real content from the current DRP website

`npm run import:drp` ([`scripts/import-drp-content.mjs`](scripts/import-drp-content.mjs))
reads the public pages and WordPress API of dubairapidproperties.com and writes
[`data/imported/`](data/imported). The data files read those JSON files, so re-running
the script and rebuilding refreshes the site.

| File | What it holds |
| --- | --- |
| `listings.json` | Every DRP Property Finder listing: title, price, specs, gallery, description, features, DLD permit, agent. Commercial units are skipped on the site. |
| `projects.json` | Off-plan projects: starting price, handover year, collections, highlights, about and location copy, gallery. |
| `construction.json` | Construction progress from DRP's status reports (the latest figure per project is shown). |
| `team.json` | Names, roles, bios and office portraits. |

Details the old site does not publish, so the new one infers or leaves out:

- **Location.** Neither the old site nor the listings carry coordinates. A listing is placed by
  the building it names, from the `BUILDINGS` list in the import script (96 of 101 do), then by
  the first community it mentions. A project uses DRP's own Location field, falling back to its
  name and text only when that field just says "Dubai". Add a row to `BUILDINGS` when a new
  building appears.
- **Maps.** Every listing and project page embeds a Google map searched by building (or
  project name) and community, with an *Open in Google Maps* link. Listings without a named
  building say the pin marks the community.
- Unit types and bedrooms are read from each project's text.
- **Developer** is named on 46 of 77 projects; the rest show the area only.
- **Payment plans** are not published, so cards and project pages hide them. The
  homepage Off-Plan tab shows unit types in their place.
- **Furnishing** appears only when the listing text says so.
- Construction updates and sale projects rarely share a name, so only matching rows
  link through to a project page.

## Wave Crest landing page (/properties/jebel-ali-villa)

The Hot Deal card for the Wave Crest villa (`data/hotDeals.ts`) opens its landing page. That page is its own project, [DRP-dulshan/jebel-ali](https://github.com/DRP-dulshan/jebel-ali), built as a static export into `public/properties/jebel-ali-villa/` and served by a rewrite in `next.config.mjs`. Its enquiry form posts to Web3Forms, as set in that repo's `content/site.ts`.

After changing the landing page in its own repo, rebuild the copy here and commit it:

```bash
scripts/build-jebel-ali-villa.sh             # from the repo's main branch
scripts/build-jebel-ali-villa.sh ../jebel-ali  # or from a local checkout
```

`/palm-jebelali-villa`, its address on the old WordPress site, redirects here.

## Search engines and the domain move

- `app/sitemap.ts` and `app/robots.ts` build `/sitemap.xml` and `/robots.txt` from the site's address (`lib/siteUrl.ts`): Vercel's production domain, or `NEXT_PUBLIC_SITE_URL` if set.
- On `*.vercel.app` and preview deployments, robots.txt blocks crawlers and every page is `noindex`. Indexing switches on by itself once the custom domain is the production domain.
- `scripts/legacy-redirects.mjs` sends the old WordPress addresses (listed in `data/legacy/wordpress-urls.json`) to their new pages, checked against the current listings and projects at each build.
- The favicon, logos and share image live in the repo (`app/icon.png`, `public/brand/`, `app/opengraph-image.jpg`).
- Every photo that came from the WordPress uploads (projects, construction updates, team, services) is in `public/media/` under its old `YYYY/MM/` path, so nothing loads from the old site. `scripts/import-drp-content.mjs` still writes WordPress URLs if it is run again; move any new photos into `public/media/` the same way.

## Placeholder content (replace before launch)

- **Agents' BRNs** — `agentBrns` in `data/licences.ts`, by name as on Property Finder. Add new agents there; the BRN shows on their profile and listings.
- **Exchange rates** — `data/currency.ts`. AED is pegged to the dollar; update EUR and GBP from time to time.
- **Vercel Web Analytics** — switch it on in the Vercel project (Analytics tab); the site already sends page views.


| Area | Status |
| --- | --- |
| Client reviews (6) | **Placeholder** — invented quotes and names. Replace with real Google reviews. |
| "Rated 4.9 on Google" | **Placeholder** — confirm the live rating. |
| Area guides (12) | **Placeholder** figures — price per sq ft, yields and drive times. |
| News articles (7) | **Placeholder** — written in DRP's voice, not real posts. |
| Team lines | Each card on `/about#team` opens a profile at `/about/team/[slug]` with the full bio, contact buttons, the person's own listings and an enquiry form. The short card line paraphrases the bio. Delia Cuadrante has no bio on the old site, so her profile shows one line about the office. No direct phone numbers or emails are published, so contact goes through the office. |
| Office hours | **Placeholder** — not published on the current site. |
| Construction tracker hero | **Placeholder** — Unsplash photo. |
| Careers hero | **Placeholder** — Unsplash office photo; replace with the DRP team group photo taken in front of the office. The application form logs its payload (CV name, size and type only); the file itself needs a multipart upload endpoint. |
| Holiday Homes URL | **Placeholder** — `HOLIDAY_HOMES_URL` in `data/external.ts` points at the current DRP site's holiday-home page. The internal `/holiday-homes/*` pages still build but are no longer linked from the site. |
| Holiday homes, packages, fees | **Placeholder** — stays, nightly rates, furnishing package prices and management fees. |
| Mortgage calculator | Real formula; fee and rate defaults are estimates to confirm with DRP's mortgage partners. |
| Market report | **Placeholder** figures; the form promises an email, no PDF is attached yet. |
| Legal pages | **Template wording** — must be reviewed by DRP's legal advisors. |
| Car fleet | One car, the VGV U70 Pro. The hero is DRP's own branded car; the 13 gallery photos in `/public/images/car-fleet/` are **temporary** manufacturer press shots. Replace them with DRP's exterior and interior photos (same file names, or edit `data/carFleet.ts`) and confirm the seat count (5 or 7). |
| Developer logos | 21 of 28 developers have their official logo. Meraas, Azizi, Wasl and Dar Global block automated downloads, and Zoya, Valores and Evera have no official site found, so these 7 show their name until a logo is added in `data/developers.ts`. |
| Partner logos (10) | **Placeholder wordmarks** — see [`/public/partners/README.md`](public/partners/README.md) to swap in SVGs. |
| Photography | Listings, projects, team, fit-out and interior photos are DRP's own; heroes and section images elsewhere are Unsplash stock or DRP office photos. Swap for DRP shoots. |

Real content already in place: contact details, office address, logos, favicon,
the hero Vimeo video, all listings, off-plan projects, construction progress, the team,
and all navigation labels.

## Structure

```
app/                  every route the site links to, each a full page
components/           Header, Footer, Hero, homepage sections, LeadForm, PageHero
components/sections/  reusable page sections (IntroSplit, FeatureGrid, ProcessSteps,
                      FaqList, StatStrip, ImageText, PackageCards, FormSection, CtaBand)
components/filters/   FilterExplorer — sticky facet bar, chips, mobile sheet, sorting
components/{properties,offplan,news,holiday,ecosystem,company,legal}/
                      page-specific components
components/nav/       DesktopNav (mega menu), MegaPanel, FullMenu
components/ui/        Reveal, ArrowLink, SectionHeading, CountUp, SmartLink, formStyles
data/                 content files (see table above)
lib/                  filters, slug and media helpers
```

Detail pages (`/properties/[slug]`, `/off-plan/[slug]`, `/areas/[slug]`, `/magazine/[slug]`)
prerender one page per item in their data file; unknown slugs return a 404.
