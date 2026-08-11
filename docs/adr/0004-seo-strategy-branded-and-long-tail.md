# ADR-004: SEO targets branded and long-tail search, not head terms

**Status:** Accepted · **Date:** 2026-08-11 · **Deciders:** Brandon Kelly
**Open:** the geographic question below is provisional pending Eric's input.

## Context

"SEO site" is the stated goal of this rebuild, and the phrase hides a strategy
choice. A solo online practice can chase three very different things:

1. **Head terms** — "therapist Denver", "counseling Denver". Highest volume,
   dominated by Psychology Today, BetterHelp, Alma, Grow Therapy, and
   multi-clinician group practices with hundreds of referring domains.
2. **Branded and referral search** — "Custom Counseling", "Eric Tulga",
   "Eric Tulga counselor". People who already have his name from a referral,
   Red Rocks Church, a Psychology Today listing, or a business card.
3. **Long-tail intent** — "online addiction counseling Colorado", "counseling
   for veterans Colorado", "men's therapist who does video sessions".

Without recording the choice, the next person to touch this site will assume
head terms were the goal, see the gaps, and start "fixing" them.

## Decision

Optimize for **branded/referral search first and long-tail intent second**.
Do not chase head terms.

Concretely, that means:

- The structured data invests in **entity clarity** — a `LocalBusiness` and a
  `Person` for Eric with his Colorado license, `@id`-linked, plus a `Service`
  node on each of the five service pages. The job is to make Google confident
  that Custom Counseling LLC and Eric Tulga are one specific, licensed, real
  practice.
- Each service page targets one specific intent in its title and H1
  ("Online Addiction Counseling in Colorado", not "Addiction").
- The five service pages link to each other in-content, so a reader who lands on
  one from search has somewhere to go and crawlers have more than one path
  through the site.

## Explicit no-s

These look like omissions. They are decisions.

- **No `FAQPage` structured data.** Google restricted FAQ rich results to
  authoritative government and health-authority sites in August 2023. A private
  practice will not get the rich result, so the markup is pure maintenance
  burden.
- **No `BreadcrumbList`.** The site is two levels deep with a persistent header.
  Breadcrumbs would describe a hierarchy the user interface does not have.
- **No local-pack / Google Business Profile push.** The practice is fully online
  and deliberately publishes no street address (`areaServed: Colorado`, no
  `streetAddress`). The local pack requires a verified physical location; the
  site's own content would contradict it.
- **No blog or content-marketing programme.** Ranking for head terms this way
  is a multi-year commitment of Eric's writing time. He is a solo practitioner
  mid-move. Proposing it would be proposing a job nobody is going to do.

## The geographic question (unresolved)

Three identities are in play: **Lakewood** (his Psychology Today address),
**Denver** (the domain, `denvercustomcounseling.com`), and **Colorado** (all the
site copy, and the actual limit of his license).

The site currently positions **statewide, with Denver-flavored anchors** — copy
says Colorado, the domain says Denver. That is provisional. It is Eric's
business decision, not a technical one, and it is in the batch of questions
waiting on him. If he wants a Denver-metro identity instead, the titles and the
`areaServed` node are where that change lands.

## Consequences

- Success looks like referral traffic converting and long-tail queries
  appearing in Search Console — not a rank for "therapist Denver". Measure it
  that way, or the strategy will read as a failure.
- Eric's Psychology Today profile is the single most valuable external asset
  under this strategy, which is why it is the only `sameAs` in the `Person`
  node. It currently contradicts the site on phone number, office address, and
  whether he sees clients in person. Resolving that is on Eric and matters more
  than anything else in this ADR.
