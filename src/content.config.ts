// Content collections for site copy that Eric edits through the CMS (/admin).
// Each collection here has a matching entry in public/admin/config.yml —
// if you add or rename a field, update both files.
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Singleton pages: one Markdown file per page, body = main copy.
const pages = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		heroHeading: z.string().optional(),
		heroSubheading: z.string().optional(),
		seoDescription: z.string().max(160).optional(),
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
