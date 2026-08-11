# Lighthouse baseline — Squarespace vs. the Astro rebuild

Captured **2026-08-10**, before the DNS cutover.

The "before" numbers here cannot be regenerated. Once the domain moves off
Squarespace, `https://www.denvercustomcounseling.com/` stops serving the old site and the
baseline is gone permanently. This file exists so the comparison survives in version
control; the raw reports are 13 MB of Lighthouse JSON and stay out of the repo
(`lighthouse/` is gitignored).

## Method

| | |
|---|---|
| Lighthouse | 13.4.1 |
| Form factor | Mobile, simulated throttling (Lighthouse defaults) |
| Runs | 3 per page for the old site, 6 for the rebuilt home page, 3 for the rebuilt contact page |
| Reported value | Median across runs |
| Before | `https://www.denvercustomcounseling.com/` (live Squarespace) |
| After | `https://customcounseling.pages.dev/` (deployed Cloudflare Pages build) |

Mobile only — no desktop runs were captured. The "after" runs targeted the real deployment
rather than a local `astro preview`, so they include genuine network variance.

## Category scores

Median of runs, as Lighthouse reports them (0–100).

| Page | | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| Home | before | **57** | 95 | 77 | 100 |
| Home | after | **96** | 100 | 100 | 100 |
| Contact | before | **57** | 96 | 100 | 100 |
| Contact | after | **100** | 100 | 100 | 100 |

## Core metrics

| Home page | Before | After | Change |
|---|---|---|---|
| First Contentful Paint | 6.07 s | 1.66 s | 3.7× faster |
| Largest Contentful Paint | 15.29 s | 2.57 s | 6.0× faster |
| Speed Index | 8.56 s | 1.67 s | 5.1× faster |
| Time to Interactive | 15.77 s | 2.58 s | 6.1× faster |
| Total Blocking Time | 123 ms | 0 ms | eliminated |
| Cumulative Layout Shift | 0 | 0 | already clean |
| Page weight | 4.86 MB | 396 KB | 92% smaller |
| Network requests | 134 | 8 | 94% fewer |

| Contact page | Before | After | Change |
|---|---|---|---|
| First Contentful Paint | 5.93 s | 1.53 s | 3.9× faster |
| Largest Contentful Paint | 13.69 s | 1.53 s | 9.0× faster |
| Speed Index | 7.66 s | 1.53 s | 5.0× faster |
| Time to Interactive | 13.71 s | 1.53 s | 9.0× faster |
| Total Blocking Time | 134 ms | 0 ms | eliminated |
| Page weight | 1.85 MB | 110 KB | 94% smaller |
| Network requests | 70 | 7 | 90% fewer |

The single biggest driver is payload. A 4.86 MB home page over 134 requests is what pushes
LCP past 15 seconds on a throttled mobile connection; the rebuild serves the same content in
8 requests.

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

## Caveat on the "100 across the board" claim

`README.md` states the production build scores 100 on all four categories. That is accurate
for Accessibility, Best Practices, and SEO, which hit 100 on every post-fix run.

Performance is less clean-cut. Across the six final home-page runs the score ranged **95–100**
with a median of **96**; exactly one run scored 100. The contact page scored 100 in two of
three runs. Since these were measured against the live Cloudflare deployment, some of that
spread is network variance rather than the build — a local `astro preview` run may well sit
higher, but no such run was saved, so it isn't evidenced here.

Worth reconciling before the claim goes into the portfolio case study: either re-measure
against `astro build && astro preview` per the documented method and save the report, or
soften the wording to "95–100, typically 100 on Accessibility, Best Practices and SEO."
