# Lighthouse baseline — Squarespace vs. the Astro rebuild

Baseline captured **2026-08-10**, before the DNS cutover. Rebuild re-measured against
`astro preview` on **2026-08-11**.

The "before" numbers here cannot be regenerated. Once the domain moves off
Squarespace, `https://www.denvercustomcounseling.com/` stops serving the old site and the
baseline is gone permanently. This file exists so the comparison survives in version
control; the raw reports are ~14 MB of Lighthouse JSON and stay out of the repo
(`lighthouse/` is gitignored).

## Method

| | |
|---|---|
| Lighthouse | 13.4.1 (identical across all runs) |
| Form factor | Mobile, simulated throttling (Lighthouse defaults) |
| Reported value | Median across runs |
| Before | `https://www.denvercustomcounseling.com/` (live Squarespace), 3 runs per page |
| After | `astro build && astro preview` on `localhost:4321`, 6 home / 3 contact runs |

Mobile only — no desktop runs were captured.

"After" follows the measurement method CLAUDE.md specifies: the production build served
locally. An earlier set of runs against the deployed `customcounseling.pages.dev` is kept as
a secondary datapoint below, since it reflects what Cloudflare actually serves.

## Category scores

| Page | | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| Home | before | **57** | 95 | 77 | 100 |
| Home | after | **97** | 100 | 100 | 100 |
| Contact | before | **57** | 96 | 100 | 100 |
| Contact | after | **100** | 100 | 100 | 100 |

Localhost eliminates network variance, and the runs bear that out: all six home-page runs
returned 97 and all three contact runs returned 100, with metric spreads under 3 ms. These
are stable numbers, not a sampled range.

## Core metrics

| Home page | Before | After | Change |
|---|---|---|---|
| First Contentful Paint | 6.07 s | 1.35 s | 4.5× faster |
| Largest Contentful Paint | 15.29 s | 2.48 s | 6.2× faster |
| Speed Index | 8.56 s | 1.35 s | 6.3× faster |
| Time to Interactive | 15.77 s | 2.50 s | 6.3× faster |
| Total Blocking Time | 123 ms | 0 ms | eliminated |
| Cumulative Layout Shift | 0 | 0.006 | both well inside "good" (<0.1) |
| Page weight | 4.86 MB | 385 KB | 92% smaller |
| Network requests | 134 | 8 | 94% fewer |

| Contact page | Before | After | Change |
|---|---|---|---|
| First Contentful Paint | 5.93 s | 1.35 s | 4.4× faster |
| Largest Contentful Paint | 13.69 s | 1.50 s | 9.1× faster |
| Speed Index | 7.66 s | 1.35 s | 5.7× faster |
| Time to Interactive | 13.71 s | 1.50 s | 9.1× faster |
| Total Blocking Time | 134 ms | 0 ms | eliminated |
| Cumulative Layout Shift | 0 | 0.03 | both well inside "good" (<0.1) |
| Page weight | 1.85 MB | 106 KB | 94% smaller |
| Network requests | 70 | 6 | 91% fewer |

The single biggest driver is payload. A 4.86 MB home page over 134 requests is what pushes
LCP past 15 seconds on a throttled mobile connection; the rebuild serves the same content in
8 requests.

## Secondary datapoint: the deployed build

Six home and three contact runs against `https://customcounseling.pages.dev/` on 2026-08-10.
Same version and form factor, but over the real network, so these vary run to run.

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 96 median (95–100 across 6 runs) | 100 | 100 | 100 |
| Contact | 100 median (100 in 2 of 3 runs) | 100 | 100 | 100 |

Deployed and local agree within normal variance, which is the useful conclusion: Cloudflare
is not costing anything measurable.

## What was failing on the old site

Unreproducible after cutover, so recorded here.

**Home page**
- `color-contrast` — insufficient foreground/background contrast (accessibility)
- `heading-order` — headings not in sequentially-descending order (accessibility)
- `third-party-cookies` — third-party cookies in use (best practices; the 77 score)
- `inspector-issues` — issues logged in the Chrome DevTools Issues panel (best practices)

**Contact page**
- `color-contrast` — same contrast failure

The contrast failure was reproduced in the rebuild's first runs (accessibility 96) and fixed
before launch — `fix-check-local.json` at 96 and `fix-check-local2.json` at 100 bracket that
change. The third-party-cookie and DevTools-issue failures are inherent to Squarespace's
platform and disappear with it.

## Why the home page is 97 and not 100

Resolved 2026-08-11. The earlier suspicion that the sub-100 Performance score was network
noise is **wrong** — measured locally it is a deterministic 97, repeated across six runs.

Accessibility, Best Practices and SEO are a genuine 100 on every post-fix run, on both local
preview and the deployed build. Only home-page Performance falls short, and only there: the
contact page is a clean 100.

Three points are lost to a single audit — `largest-contentful-paint` scores 0.90 at 2.48 s
(weight 25 in the Performance score). Everything else is either full marks or negligible.
Lighthouse's diagnostics point at the hero image as the LCP element
(`main#main > section.relative > img.absolute`):

- `image-delivery` — an estimated 206 KiB recoverable across the page's images
- `lcp-discovery` — the LCP image is not discoverable early in the document
- `render-blocking` — an estimated 720 ms recoverable

None of this is measured as fixed. Likely levers are `fetchpriority="high"` and a preload on
the hero, plus tighter compression on it, but that work has not been done or verified.

**`README.md` currently claims 100 across all four categories, which is not accurate for
home-page Performance.** Correct it to 97 there, or state the range, before the claim reaches
the portfolio case study. 97 with a documented reason is a stronger artefact than a round
number that does not reproduce.
