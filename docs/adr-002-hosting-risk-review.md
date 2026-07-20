# ADR-002: Hosting Risk Review — Cloudflare Pages under high and hostile traffic

**Status:** Accepted · **Date:** 2026-07-20 · **Deciders:** Brandon Kelly
**Reviews:** ADR-001 (Decisions 2 and 3 — hosting and forms)

## Summary for Eric (plain language)

We double-checked the decision to host your site on Cloudflare, specifically
asking: what if the site suddenly gets a huge amount of traffic, or someone
attacks it — could you get a surprise bill?

**The answer is no.** Cloudflare doesn't charge for the kind of traffic your
site produces, no matter how much of it there is. Even a large attack costs
nothing. What we found instead is that the things worth worrying about aren't
about money at all — they're about the site or the contact form being
*unavailable*. We've added protections for those.

## Context

ADR-001 chose Cloudflare Pages (free tier) on a promise to the client of
~$10–15/yr, versus ~$200–300/yr on Squarespace. The client is non-technical
and a surprise bill would be a serious breach of trust.

ADR-001 justified the choice largely on generous free-tier limits. That
reasoning was never stress-tested. This review asks the pessimistic question:
under a viral spike, a DDoS, AI-crawler floods, or spam abuse, what could this
actually cost, and what is the worst realistic outcome?

## The site's risk profile

Verified against the build, not assumed:

- `output: 'static'` — no SSR, no adapter, no functions, no database, no API
  routes, no dynamic routes
- 13 static pages, 684 KB total build, 36 files
- Zero JavaScript bundles (~1.1 KB inlined per page); no framework runtime
- Fonts self-hosted; no Google Fonts, no analytics, no tag manager, no embeds
- Cold page load ~134 KB, warm ~15 KB
- Only runtime third-party call: the Web3Forms POST, on form submission only

This profile matters: it is the reason the cost analysis comes out the way it
does. **Every conclusion below is contingent on the site staying static.**

## Decision

**Stay on Cloudflare Pages free tier**, and reframe the risk register from
cost to availability.

## Finding 1 — Hosting cost risk is structurally nil

Cloudflare's Pages documentation states that requests to static assets are
"free and unlimited" on free *and* paid plans. Static bandwidth is not a
metered dimension — this is not a high cap with a fair-use backstop, it is the
absence of a billing meter. DDoS mitigation is separately and explicitly
unmetered on all plans, a standing public commitment since 2017.

Modelled scenarios, both **$0** on Cloudflare Pages:

| Scenario | Bandwidth | Cost |
|---|---|---|
| Viral spike, 500K pageviews/week | ~30–65 GB | $0 |
| Hostile flood, 10M requests/day | 150 GB–1.3 TB/day | $0 |

The old Terms of Service §2.8 restriction on non-HTML content was removed in
May 2023, and never applied to Pages-hosted assets in any case (it targeted
proxying externally-hosted media). The site has no video and no large files.

### What the same traffic would cost elsewhere

| Platform | 500K-pageview spike | 10M-req/day flood |
|---|---|---|
| **Cloudflare Pages Free** | **$0** | **$0** |
| Netlify Free (2026 credit model, ~15 GB) | site **pauses mid-spike** | dark for the billing cycle |
| Vercel Hobby | survives, but Hobby **forbids commercial use** | paused; on Pro this is the documented $23K DDoS bill pattern |
| AWS S3 + CloudFront | $0 (within Always Free) | ~$27–30/day; ~$770–800 for a week |

Every alternative is worse for this project: metered billing exposure, an
availability cliff at a far more plausible threshold, or — in Vercel's case —
a terms-of-service conflict, since a for-profit practice site does not qualify
for the Hobby tier at all, independent of traffic.

Note the honest bound: the AWS worst case here is hundreds of dollars, not the
five- and six-figure horror stories, because this site has no large media to
weaponise and no per-request compute to multiply. But an unbudgeted few hundred
dollars landing on a solo therapist's card is still a real risk that Cloudflare
Pages eliminates by design.

## Finding 2 — The real risks are availability, not cost

Ranked by expected harm to the practice:

1. **Account suspension on a false-positive abuse or DMCA report.** Multiple
   documented Cloudflare cases of account-wide shutdowns persisting for days
   even after the report was retracted. The free tier has **no SLA**, and
   free-tier ticket support is limited to billing and account issues — not
   technical ones. For a site that *is* the practice's intake channel, days of
   silent downtime with no appeal path is worse than any dollar figure in this
   document.

2. **Web3Forms spam exhaustion — a vector ADR-001 did not consider.** The
   access key is embedded client-side and therefore scrapeable. A spammer can
   POST directly to `api.web3forms.com/submit` from anywhere, **bypassing the
   honeypot entirely**, because the honeypot only fires through our own HTML
   form. Origin-locking the key is a Pro-tier feature. At the 250/month free
   cap Web3Forms hard-stops rather than billing, so the failure mode is a
   **dead contact form for the rest of the month**, plus the client's inbox
   buried in spam notifications so a genuine inquiry is missed.

3. **The CMS auth Worker is publicly routable.** 100K requests/day free,
   hard-stopping rather than billing. Background scanners could exhaust the
   quota and block CMS login exactly when it is needed.

4. **Build quota exhaustion (500/month).** Every CMS save triggers a commit and
   a rebuild. Hitting the cap freezes the live site at the last successful
   deploy — a silent staleness failure a non-technical client would not notice.

5. **Free-tier terms drift.** Cloudflare has tightened specific free-tier
   parameters before (DNS record limits cut in 2024). The "unlimited static
   bandwidth" commitment is core to their business model and has been stable
   for years, but this ADR should be revisited rather than treated as settled.

## Consequences

**Easier:** cost conversations with the client are now settled with sourced
figures rather than optimism; the site can absorb any realistic traffic event
without financial exposure.

**Harder:** the mitigations below add a third-party dependency to the contact
page (hCaptcha) and a small amount of operational documentation to maintain.

**Mitigations adopted:**

- A recovery runbook covering account suspension, with a pre-staged fallback
  deploy target — the static build is portable and `_redirects` uses the same
  format on Netlify
- Uptime monitoring so downtime surfaces in minutes rather than when a
  prospective client can't reach the site
- Cloudflare Access or a rate-limit rule on the CMS auth Worker route

**Mitigation rejected after measurement: hCaptcha on the contact form.**

The obvious fix for risk 2 was a captcha, so we implemented hCaptcha and
measured it. It closed the vector, but the cost was worse than expected:

| | Without | With hCaptcha |
|---|---|---|
| Performance | 100 | 98 |
| Accessibility | 100 | 100 |
| **Best Practices** | **100** | **58** |
| SEO | 100 | 100 |

The Best Practices collapse traced to three audits, all caused by hCaptcha:
it sets a third-party cookie (`__cf_bm`), triggers Chrome DevTools cookie
issues, and calls the **deprecated Protected Audience API** — Google's
interest-group *ad-targeting* interface.

That last point is the disqualifying one, and it isn't really about the score.
Loading an ad-targeting API on the contact page of a mental-health practice —
the exact page where someone discloses they are seeking help for addiction or
depression — contradicts the privacy posture that is a genuine selling point
for this practice, and sits badly beside the project's "no health-data
analytics" rule.

Weighed against a risk that is currently **theoretical** — the form is not
live, expected volume is 10–30/month against a 250 cap, and the honeypot still
stops ordinary bots — the trade wasn't worth it. **Decision: ship without a
captcha.** Interim coverage is the honeypot, the Web3Forms 90%-quota warning
routed to both Brandon and Eric, and Eric's phone and email visible on the
Contact page as an always-working fallback.

If spam becomes real, the escalation is the self-built Pages Function +
Turnstile form (Turnstile sets no third-party cookies), not a captcha bolted
onto the free tier. Accept the metered-billing caveat below when that happens.

## Revisit this decision if

- Cloudflare announces changes to Pages or Workers free-tier pricing
- **The site gains any dynamic dimension** — Pages Functions, D1, KV, SSR, or
  an adapter. This inherits exactly the metered-billing exposure documented
  above for Vercel and Netlify, and invalidates Finding 1.
- Form volume approaches the 250/month cap, or spam becomes a recurring problem
  (the escalation path is the self-built Pages Function + Turnstile option that
  ADR-001 parked as a post-launch project, not the Web3Forms Pro tier — Pro at
  ~$144–216/yr would erase most of the savings versus Squarespace)
- The practice's dependence on the site grows to where a multi-day outage is
  unacceptable, at which point a paid tier with an SLA becomes worth pricing

## Sources

- [Cloudflare Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/) — "requests to static assets are free and unlimited"
- [Cloudflare Pages platform limits](https://developers.cloudflare.com/pages/platform/limits/) — 500 builds/mo, 20,000 files, 25 MiB/file
- [Cloudflare DDoS protection](https://developers.cloudflare.com/ddos-protection/about/) — unmetered mitigation on all plans
- [Goodbye Section 2.8](https://blog.cloudflare.com/updated-tos) — 2023 ToS change
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) — 100K req/day free, hard stop
- [Vercel Hobby plan terms](https://vercel.com/docs/plans/hobby) — non-commercial use restriction
- [Netlify free-tier overage behaviour](https://answers.netlify.com/t/what-happens-if-a-free-plan-exceeds-bandwidth-and-or-build-minutes-limit/16244)
- [AWS CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/) — Always Free tier
- [Web3Forms spam protection](https://docs.web3forms.com/getting-started/customizations/spam-protection/spam-protection)
- Cloudflare Community threads on false-positive suspensions:
  [retracted phishing report](https://community.cloudflare.com/t/cf-shut-down-my-services-a-week-ago-due-to-a-meanwhile-retracted-phishing-report/615353),
  [false-positive escalation](https://community.cloudflare.com/t/account-suspended-false-positive-phishing-escalate-to-trust-safety/931830)

Figures not independently verified and flagged as such: Web3Forms Pro exact
pricing (their pricing page blocks automated fetch; ~$12–18/mo per third-party
comparisons — verify before quoting to the client), and Cloudflare's exact
behaviour at build #501 (undocumented; no pay-per-build option exists, so the
outcome is a hard stop or a plan upgrade, not metered billing).
