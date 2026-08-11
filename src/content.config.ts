// Content collections for site copy that Eric edits through the CMS (/admin).
// Each collection here has a matching entry in public/admin/config.yml —
// if you add or rename a field, update both files.
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Singleton pages: one Markdown file per page, body = main copy.
//
// Fields are optional at the schema level because this collection is shared by
// pages with different shapes — about.md has no hero, telehealth.md has no
// slogan. The CMS marks each one required on the page that actually uses it.
//
// EVERY constraint here needs a matching constraint in public/admin/config.yml.
// A violation is a hard build failure that Eric never sees: Sveltia reports
// "published", the build fails, the live site quietly stays put.
const pages = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		heroSlogan: z.string().optional(),
		heroTagline: z.string().optional(),

		// There is deliberately no seoDescription here. Page titles and meta
		// descriptions are code-owned, in src/lib/seo.ts — see
		// docs/adr/0003-code-owned-page-metadata.md for why.

		// About (about.md). The "what I like to do for fun" list is the best
		// trust content carried over from the old site (build reference §4), and
		// the thing most likely to go stale — so Eric owns it.
		funList: z.array(z.string()).optional(),

		// Online Sessions (telehealth.md). Layout, headings, and the photo stay
		// code-owned; only the prose is editable.
		firstSessionSteps: z.array(z.string()).optional(),
		checklist: z.array(z.string()).optional(),
		couplesBody: z.string().optional(),
		privacyBody: z.string().optional(),
		techFailureBody: z.string().optional(),

		// ---------------------------------------------------------------------
		// The five service pillar pages.
		//
		// Same split as telehealth: Eric owns the words, code owns the shape.
		// The H1 stays in the .astro file with the <title> it was written
		// against — those two are a keyword pair (docs/adr/0004), and an H1 Eric
		// can rewrite is the one field that could silently undo the page's
		// targeting. Section H2s, the dot styling, the grids, and the photo are
		// code-owned for the same reason funList's markup is.
		// ---------------------------------------------------------------------

		// The <p> under the H1. Emotional copy, no SEO weight — all five pages.
		heroSubhead: z.string().optional(),

		// Closing paragraphs, after the lists (addiction, men's, veterans).
		closingBody: z.string().optional(),

		// "What we can work on" (men's, veterans). An item links when it names
		// something with a page of its own, so the pillar pages stay connected
		// to each other — see RelatedServices.astro. `link` is a fixed dropdown
		// in the CMS, never free text, so Eric cannot type a dead internal URL.
		workOnList: z
			.array(z.object({ text: z.string(), link: z.string().optional() }))
			.optional(),

		// Addiction (addiction-counseling.md).
		helpWithList: z.array(z.string()).optional(),
		gainsList: z.array(z.string()).optional(),

		// Anxiety & depression (anxiety-and-depression.md).
		anxietySigns: z.array(z.string()).optional(),
		depressionSigns: z.array(z.string()).optional(),
		howWeWorkBody: z.string().optional(),

		// Couples (couples-counseling.md).
		questions: z.array(z.string()).optional(),
		approachBody: z.string().optional(),
		videoBody: z.string().optional(),
	}),
});

// Repeatable list: one Markdown file per service, body = description.
// href points at the service's dedicated pillar page (code-owned, not CMS-editable).
const services = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/services' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		href: z.string().optional(),
		order: z.number().default(0),
	}),
});

// Repeatable list: one Markdown file per question, body = answer.
const faq = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/faq' }),
	schema: z.object({
		question: z.string(),
		order: z.number().default(0),
	}),
});

// Site-wide settings, single YAML file with everything nested under a `site:`
// key so the CMS (an "object" field) and this loader (object-of-entries mode)
// agree on the shape. Fetch with getEntry('settings', 'site').
const settings = defineCollection({
	loader: file('./src/content/settings/site.yml'),
	schema: z.object({
		phone: z.string(),
		email: z.string().email(),
		serviceArea: z.string(),
		responsePromise: z.string(),
		feeIndividual: z.string(),
		feeCouples: z.string(),
		telehealthDisclaimer: z.string(),
	}),
});

export const collections = { pages, services, faq, settings };
