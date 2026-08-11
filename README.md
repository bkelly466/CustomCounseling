# Custom Counseling LLC — Website

A rebuild of [denvercustomcounseling.com](https://denvercustomcounseling.com),
migrating a Colorado counseling practice off Squarespace to a static
[Astro](https://astro.build) site as it transitions to an online-only
(telehealth) model.

**Status:** built, pre-launch. The live domain still serves the old
Squarespace site.

## Why this rebuild

| Goal | Approach |
|---|---|
| Cut running costs | ~$200–300/yr on Squarespace → ~$10–15/yr (domain only) |
| Support the online-only pivot | Copy and SEO reframed from a Denver-office practice to statewide Colorado telehealth |
| Keep search visibility | Existing URLs preserved where possible; 301 map for the rest; per-page metadata and JSON-LD |
| Meet WCAG 2.1 AA | Semantic HTML, keyboard-operable nav, AA-verified colour contrast |
| Let the client edit copy | Git-based CMS at `/admin`, no database and no subscription |

On the production build, Lighthouse scores **100** for Accessibility, Best
Practices, and SEO on every page, and **98–100** for Performance — 100 on the
contact page, 98 on the home page, where the hero image holds LCP at 2.25 s.
Measured mobile against `astro preview`; full before/after in
[`docs/lighthouse-baseline.md`](docs/lighthouse-baseline.md).

## Stack

- **[Astro](https://astro.build)** — static output, zero client JS by default
- **[Tailwind CSS v4](https://tailwindcss.com)** — via `@tailwindcss/vite`
- **[Sveltia CMS](https://sveltiacms.app/)** — git-based content editing at `/admin`
- **Cloudflare Pages** — hosting (free tier, unlimited bandwidth)
- **Web3Forms** — contact form delivery, host-independent

## Commands

Run from the project root:

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Serve the production build locally |

> Measure Lighthouse against `npm run build && npm run preview`, never the dev
> server — dev mode is unminified and ships a hot-reload client, which
> understates Performance by 10–15 points.

## Project structure

```text
src/
├── components/        # Header, Footer, ContactForm, ServiceCards, …
├── content/           # CMS-editable copy (Markdown + YAML)
│   ├── pages/         # Home and About intro text
│   ├── services/      # One file per service (drives cards, nav, footer)
│   ├── faq/           # One file per question
│   └── settings/      # Phone, email, fees, disclaimers
├── content.config.ts  # Content collection schemas
├── layouts/           # Base layout: meta tags, OG, skip link
├── pages/             # One .astro file per route
└── styles/global.css  # Design tokens and component classes

public/
├── _redirects         # 301 map from the old Squarespace URLs
├── admin/             # Sveltia CMS config
└── robots.txt
```

Routes mirror the file names in `src/pages/`. Old slugs (`/mens-counseling`,
`/telehealth`, …) were deliberately preserved to avoid redirect churn.

## Content editing

Editable copy lives in `src/content/` as Markdown and YAML, and is exposed to
the client through Sveltia CMS at `/admin`. Schemas in `content.config.ts` and
field definitions in `public/admin/config.yml` must be kept in sync — if you
add or rename a field, update both.

Editable scope is deliberately narrow: page intro text, services, FAQ entries,
fees, and contact details. Layout, metadata, and redirects stay code-only.

## Deployment

Cloudflare Pages, building from `main`:

- Build command: `npm run build`
- Output directory: `dist`

`public/_redirects` is picked up automatically for the 301 map. A sitemap is
generated at build time via `@astrojs/sitemap`.

## Notes

- All images, logo, and favicons are the client's own assets, served through
  Astro's `<Image>` component.
- The contact form delivers live through Web3Forms to the client's inbox.
- Copy is editable by the client through Sveltia CMS at `/admin`.
- Setup and handoff documentation is maintained locally and intentionally kept
  out of version control.
