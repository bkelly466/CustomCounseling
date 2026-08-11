# Custom Counseling

The marketing website for Custom Counseling LLC — Eric Tulga's solo, fully
online counseling practice, licensed in Colorado. A static Astro site with a
Git-backed CMS so Eric can edit the copy that dates fastest.

## Language

### The practice

**Practice**:
Custom Counseling LLC — the business. One counselor, no office, no employees.
_Avoid_: clinic, agency, firm

**Counselor**:
Eric Tulga, MA, LPC. The practice's only clinician.
_Avoid_: therapist (in code and structured data — his license says
"Licensed Professional Counselor"; "therapist" is fine in visitor-facing copy
where it is the word people search for)

**Practice fact**:
A piece of information about the practice that can change without the site
being rebuilt — the phone number, email, session fees, the service-area blurb.
Every one has exactly one home: the `settings` content collection. Nothing
restates one.

> **Naming mismatch, deliberate:** that collection is called `settings` in
> `src/content.config.ts` and shows in the CMS as "Site Settings", even though
> what it holds is practice facts, not settings. Renaming it would touch the
> content config, the CMS config, six components, and Eric's sidebar — real
> breakage risk against a documented hard-build-failure hazard, for no
> user-visible gain. Read `settings` as "practice facts" and move on.

### What Eric offers

**Service**:
One thing the practice offers — men's counseling, couples counseling,
addiction counseling, anxiety and depression, counseling for veterans. Lives as
an entry in the `services` content collection, which Eric owns. Its `href`
points at the Specialty Page that markets it.
_Avoid_: specialty, offering, program

**Specialty Page**:
The dedicated page a Service links to — `/mens-counseling`, `/veterans`, and so
on. Five of them. The Service entry supplies the name and summary; the page
supplies the copy, the layout, and the structured data. Editing a Service in the
CMS does not edit its Specialty Page — they are two separate entries, and the
Service summary is deliberately the short one, because `serviceNode()` quotes it
into the page's JSON-LD and Related Services prints it under the link.
Each Specialty Page's *words* are Eric's, in the `pages` collection; its
*shape* — the H1, the section headings, the lists' markup, the photo — is
code-owned. See "Page metadata" for why the H1 is on the code side of that line.
_Avoid_: pillar page, landing page, service page (ambiguous — reads as either
half of this pair)

**Session**:
One 50-minute counseling appointment over video. Priced individually or as a
couple.
_Avoid_: appointment, meeting, visit

**Free consultation**:
The 15-minute phone call every new client starts with, before any session. Not
a session, and never priced.
_Avoid_: intake, discovery call, first appointment

### The site

**Page metadata**:
A page's `<title>`, meta description, share card, and JSON-LD. Code-owned,
keyed by pathname in `src/lib/seo.ts` — deliberately not CMS-editable. See
[ADR-003](./docs/adr/0003-code-owned-page-metadata.md). A page's **H1** is on
this side of the line too, even though it is on-page copy rather than metadata:
it is written against the `<title>` it sits under and the pair carries the
page's long-tail targeting ([ADR-004](./docs/adr/0004-seo-strategy-branded-and-long-tail.md)).
The Home hero is the one exception — that H1 is a brand slogan, not a keyword
target, and Eric owns it as `heroSlogan`.
_Avoid_: SEO fields, SEO description (the removed CMS field went by that name;
reusing it invites someone to add it back)

**Chrome**:
The parts of a page that repeat across the whole site — header, footer, the
First Steps band, CTA bands, Related Services. Distinct from in-content, which
is the copy unique to one page. The distinction matters for internal linking:
chrome links do not tell a crawler anything about the page they sit on.
