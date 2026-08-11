# ADR-003: Page metadata is code-owned, not CMS-editable

**Status:** Accepted · **Date:** 2026-08-11 · **Deciders:** Brandon Kelly

## Context

This is a CMS-driven site. Eric edits page copy, FAQs, service descriptions,
fees, and contact details through Sveltia at `/admin`, and the guiding principle
everywhere else has been "if it dates, Eric owns it."

Page `<title>` and `<meta description>` are the one deliberate exception. A
future maintainer looking at a site where Eric can edit almost everything *will*
wonder why the SEO fields alone are locked in TypeScript, and would otherwise
"fix" it by adding the field back.

## Decision

Every page's title, meta description, Open Graph data, and JSON-LD live in
`src/lib/seo.ts`, keyed by pathname. `Layout.astro` looks the current page up
from `Astro.url` and renders the result; pages pass nothing. The
`seoDescription` field has been removed from `src/content.config.ts`,
`public/admin/config.yml`, and the three Markdown files that carried it.

## Why

**The field was already broken.** `seoDescription` existed on Home, About, and
Online Sessions, and only Online Sessions ever read it. Eric could edit the
Home and About values, watch Sveltia report "published", and change nothing on
the live site. The values had in fact already drifted from the hardcoded ones
the pages actually used.

**The failure mode is silent and one-directional.** A description is not copy
you can eyeball on the page. If Eric truncates one, duplicates one across two
pages, or exceeds the 160-character cap, nothing looks wrong in the CMS — the
damage shows up weeks later in search results, or as a hard build failure that
leaves the live site quietly on the previous deploy (see the standing warning in
`AGENTS.md` about Zod constraints and `config.yml`).

**Auditing needs one file.** The point of the registry is that checking all 13
pages for a duplicate, an over-length description, or a missing one is a single
file read. Spreading them back across content files gives that up.

## Consequences

- A new page must be added to `PAGES` in `src/lib/seo.ts` or the build fails
  with a named error. That is intentional: a page with no metadata should never
  reach production.
- Eric cannot change a meta description himself. He raises it at copy review and
  Brandon edits one file. Given the review cadence this project already runs on
  (D11, consolidated copy review), that is not a new bottleneck.
- Practice **facts** are unaffected and still come from the CMS. `/faq`'s
  description quotes the session fees, so its registry entry is a function of
  the `settings` collection rather than a literal string — Eric changing $140 in
  Site Settings changes the search snippet. The rule is metadata is code-owned;
  facts are Eric's, wherever they appear.

## Rejected alternatives

- **Leave `seoDescription` and wire up the two pages that ignore it.** Fixes the
  dead field but keeps every argument above against CMS-owned metadata, and
  leaves the audit problem in place.
- **Keep it CMS-editable but generate a report at build time.** More machinery
  than the problem deserves for a 13-page site with one editor.
