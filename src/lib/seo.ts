// Every page's <head> metadata and structured data, in one place.
//
// Before this module, all 13 pages hardcoded their own <title> and <meta
// description> at the <Layout> call site, and the only JSON-LD on the site was
// a literal object pasted into index.astro. Checking for a duplicate or
// over-length description meant opening 13 files, and the practice's phone
// number and fees were each written out three separate times — so they had
// already drifted.
//
// Two rules hold this together:
//
//   1. Page metadata is CODE-owned, keyed by pathname. It is deliberately NOT
//      CMS-editable. See docs/adr/0003-code-owned-page-metadata.md.
//   2. Every practice FACT (phone, email, fees) is derived from the `settings`
//      collection, which Eric does own. Nothing here restates one.
//
// Layout.astro is the only consumer: it calls buildHead() and renders the
// result. Pages pass nothing.
import { getCollection, getEntry } from 'astro:content';

/** Eric's Psychology Today profile — his only external `sameAs` today. */
const PSYCHOLOGY_TODAY_URL =
	'https://www.psychologytoday.com/us/therapists/eric-tulga-lakewood-co/1014645';

/** Colorado DORA license, also printed on /privacy for the mandatory disclosure. */
const LICENSE_NUMBER = 'LPC.0021647';

/** 1200x630 share card. Regenerate with `node scripts/build-og-image.mjs`. */
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

const PRACTICE_NAME = 'Custom Counseling LLC';

const PRACTICE_DESCRIPTION =
	'Online counseling for adults and couples across Colorado: anxiety, depression, ' +
	'addiction, men’s counseling, couples counseling, and counseling for veterans.';

// Schema.org node ids. They are stable, absolute, and fragment-based so every
// page's graph can point at the same two entities: the practice and Eric.
const practiceId = (site: URL) => new URL('/#practice', site).href;
const counselorId = (site: URL) => new URL('/about#eric', site).href;

// ---------------------------------------------------------------------------
// Practice facts, derived from the settings collection
// ---------------------------------------------------------------------------

export type Practice = {
	/** Display form, as Eric types it in the CMS: "720-235-8357". */
	phone: string;
	/** E.164, which is what schema.org wants: "+17202358357". */
	phoneE164: string;
	email: string;
	feeIndividual: string;
	feeCouples: string;
	/** schema.org priceRange, e.g. "$140-$175". */
	priceRange: string;
};

/**
 * Eric types a human phone number into the CMS; schema.org wants E.164. North
 * America is assumed — a Colorado-licensed practice that can only treat
 * Colorado residents is not going to publish a foreign number.
 */
export function toE164(phone: string): string {
	const digits = phone.replace(/\D/g, '');
	return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
}

/** Strips the currency symbol off a CMS fee ("$140" -> "140") for JSON-LD. */
function feeAmount(fee: string): string {
	return fee.replace(/[^0-9.]/g, '');
}

export async function getPractice(): Promise<Practice> {
	const { data } = await getEntry('settings', 'site');
	return {
		phone: data.phone,
		phoneE164: toE164(data.phone),
		email: data.email,
		feeIndividual: data.feeIndividual,
		feeCouples: data.feeCouples,
		priceRange: `${data.feeIndividual}-${data.feeCouples}`,
	};
}

// ---------------------------------------------------------------------------
// The page registry
// ---------------------------------------------------------------------------

/**
 * A description is usually a constant string. It becomes a function only when
 * it needs to quote a fact Eric owns — /faq names the session fees, and those
 * live in Site Settings.
 */
type Description = string | ((practice: Practice) => string);

type PageMeta = {
	/** Full <title> text, ~55 characters. */
	title: string;
	/** Meta description, ~155 characters. */
	description: Description;
	/** Absolute-from-root path to a 1200x630 card. Defaults to the site card. */
	ogImage?: string;
	/** Emit a Service node. Name and copy come from the services collection. */
	service?: { fee: 'individual' | 'couples' };
	/** Emit the Person node for Eric. Exactly one page sets this. */
	counselor?: true;
};

const PAGES = {
	'/': {
		title: 'Online Therapy in Colorado | Custom Counseling LLC',
		description:
			// 157 chars. "15-minute" was dropped from the old value at 163, which
			// Google truncated mid-phrase; the call still says 15 minutes on the page.
			"Online counseling for adults and couples across Colorado. Anxiety, depression, addiction, and men's counseling with Eric Tulga, MA, LPC. Free consultation.",
	},
	'/about': {
		title: 'About Eric Tulga, MA, LPC — Colorado Online Therapist',
		description:
			'Meet Eric Tulga, MA, LPC — a Colorado-licensed counselor working with adults and couples online. Warm, practical, and a little bit funny.',
		counselor: true,
	},
	'/services': {
		title: 'Online Counseling Services in Colorado | Custom Counseling',
		description:
			"Men's counseling, couples therapy, anxiety, depression, and addiction counseling — all online, for adults anywhere in Colorado.",
	},
	'/mens-counseling': {
		title: "Men's Online Counseling in Colorado | Custom Counseling",
		description:
			"Online therapy for men dealing with work stress, anxiety, depression, or feeling stuck. A counselor who gets how men talk. Colorado residents.",
		service: { fee: 'individual' },
	},
	'/couples-counseling': {
		title: 'Online Couples Counseling in Colorado | Custom Counseling',
		description:
			'Structured online couples counseling — a focused 8–12 week approach to rebuild communication and connection. For couples anywhere in Colorado.',
		service: { fee: 'couples' },
	},
	'/addiction-counseling': {
		title: 'Online Addiction Counseling in Colorado | Custom Counseling',
		description:
			'Confidential online counseling for alcohol, drug, and porn addiction. Individual therapy to understand triggers and build a path forward.',
		service: { fee: 'individual' },
	},
	'/anxiety-and-depression': {
		title: 'Online Anxiety & Depression Therapy in Colorado',
		description:
			"Online therapy for anxiety and depression — a confidential space to stabilize, understand what's underneath, and get your life moving again.",
		service: { fee: 'individual' },
	},
	'/veterans': {
		title: 'Online Counseling for Veterans in Colorado',
		description:
			"Online therapy for veterans dealing with PTSD, substance use, grief, anxiety, or depression — with a counselor experienced in veterans' care.",
		service: { fee: 'individual' },
	},
	'/telehealth': {
		title: 'How Online Therapy Sessions Work | Custom Counseling',
		description:
			"What to expect from online counseling: secure Google Meet sessions, simple setup, and the same conversation you'd have in an office — from home.",
	},
	'/faq': {
		title: 'Fees & FAQs | Custom Counseling LLC',
		// Quotes the fees, so it reads them from Site Settings rather than
		// restating them. Eric changing $140 in the CMS changes this snippet.
		description: (practice) =>
			`Session fees (${practice.feeIndividual} individual, ${practice.feeCouples} couples), payment options, cancellation policy, and answers to common questions about starting therapy.`,
	},
	'/contact': {
		title: 'Contact | Free 15-Minute Consultation',
		description:
			"Reach out through the contact form and Eric will reply within 2–3 business days — or book a free 15-minute phone consultation to see if it's a fit.",
	},
	'/privacy': {
		title: 'Privacy & Disclosures | Custom Counseling LLC',
		description:
			'How this website handles your information, plus the Colorado mandatory disclosure information for counseling clients.',
	},
	'/404': {
		title: 'Page Not Found | Custom Counseling LLC',
		description:
			"That page doesn't exist, but you're not lost. Head back to the homepage or get in touch.",
	},
} satisfies Record<string, PageMeta> as Record<string, PageMeta>;

/**
 * Astro hands us "/about" in dev and "/about/" from the built site, depending
 * on trailingSlash config and how the page was reached. Normalise to the
 * registry's key shape before looking anything up.
 */
function normalise(pathname: string): string {
	const trimmed = pathname.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

function practiceNode(site: URL, practice: Practice) {
	return {
		'@type': 'LocalBusiness',
		'@id': practiceId(site),
		name: PRACTICE_NAME,
		url: new URL('/', site).href,
		telephone: practice.phoneE164,
		email: practice.email,
		description: PRACTICE_DESCRIPTION,
		image: new URL(DEFAULT_OG_IMAGE, site).href,
		// No streetAddress on purpose: the practice is fully online and has no
		// public office. areaServed carries the geography instead.
		areaServed: { '@type': 'State', name: 'Colorado' },
		priceRange: practice.priceRange,
		founder: { '@id': counselorId(site) },
		employee: { '@id': counselorId(site) },
	};
}

function counselorNode(site: URL, practice: Practice) {
	return {
		'@type': 'Person',
		'@id': counselorId(site),
		name: 'Eric Tulga',
		honorificSuffix: 'MA, LPC',
		jobTitle: 'Licensed Professional Counselor',
		url: new URL('/about/', site).href,
		telephone: practice.phoneE164,
		email: practice.email,
		worksFor: { '@id': practiceId(site) },
		// The one external profile that identifies the same person. Keep this
		// list short and accurate — a `sameAs` pointing somewhere stale is a
		// worse entity signal than no `sameAs` at all.
		sameAs: [PSYCHOLOGY_TODAY_URL],
		hasCredential: {
			'@type': 'EducationalOccupationalCredential',
			credentialCategory: 'license',
			name: 'Licensed Professional Counselor, State of Colorado',
			identifier: LICENSE_NUMBER,
			recognizedBy: {
				'@type': 'GovernmentOrganization',
				name: 'Colorado Department of Regulatory Agencies',
			},
		},
		knowsAbout: [
			'Anxiety',
			'Depression',
			'Addiction counseling',
			'Couples counseling',
			"Men's mental health",
			'Veterans mental health',
		],
	};
}

/**
 * The Service node's name and copy come from the services collection, matched
 * on the `href` that already points at this page — so Eric editing a service
 * summary in the CMS updates the structured data too. A pillar page with no
 * matching collection entry simply gets no Service node rather than a
 * hand-maintained duplicate that can fall out of step.
 */
async function serviceNode(
	site: URL,
	path: string,
	canonical: URL,
	practice: Practice,
	fee: 'individual' | 'couples',
) {
	const services = await getCollection('services');
	const match = services.find((entry) => entry.data.href === path);
	if (!match) return null;

	return {
		'@type': 'Service',
		'@id': new URL(`${path}#service`, site).href,
		name: match.data.title,
		description: match.data.summary,
		serviceType: match.data.title,
		url: canonical.href,
		provider: { '@id': practiceId(site) },
		areaServed: { '@type': 'State', name: 'Colorado' },
		availableChannel: {
			'@type': 'ServiceChannel',
			serviceUrl: new URL('/contact/', site).href,
			availableLanguage: 'English',
		},
		offers: {
			'@type': 'Offer',
			price: feeAmount(fee === 'couples' ? practice.feeCouples : practice.feeIndividual),
			priceCurrency: 'USD',
			description: '50-minute session',
		},
	};
}

// ---------------------------------------------------------------------------
// The one function Layout calls
// ---------------------------------------------------------------------------

export type HeadMeta = {
	title: string;
	description: string;
	canonical: URL;
	ogImage: URL;
	/** Serialised JSON-LD, or null for pages that carry no structured data. */
	jsonLd: string | null;
};

export type HeadOverrides = {
	title?: string;
	description?: string;
};

/**
 * Resolve everything the <head> needs for one page.
 *
 * `overrides` exists for routes the registry cannot know about ahead of time.
 * There are none today; every page in src/pages has a registry entry, and an
 * unregistered path is a build error rather than a silently untitled page.
 */
export async function buildHead(
	url: URL,
	site: URL | undefined,
	overrides: HeadOverrides = {},
): Promise<HeadMeta> {
	if (!site) {
		// Only reachable if `site` is dropped from astro.config.mjs, which would
		// also break canonicals and the sitemap. Fail loudly at build time.
		throw new Error('astro.config.mjs must set `site` — canonical URLs depend on it.');
	}

	const path = normalise(url.pathname);
	const meta = PAGES[path];
	if (!meta) {
		throw new Error(`No metadata registered for "${path}". Add it to PAGES in src/lib/seo.ts.`);
	}

	const practice = await getPractice();
	// Astro's build format decides whether pathname carries a trailing slash;
	// pass it through untouched so the canonical keeps matching what Cloudflare
	// actually serves (see the verified 301 map in public/_redirects).
	const canonical = new URL(url.pathname, site);

	const description =
		overrides.description ??
		(typeof meta.description === 'function' ? meta.description(practice) : meta.description);

	// Every page that carries structured data also carries the practice node, so
	// each graph resolves on its own without depending on a crawler having
	// already parsed the home page.
	const nodes: object[] = [];
	if (meta.counselor) {
		nodes.push(counselorNode(site, practice));
	}
	if (meta.service) {
		const node = await serviceNode(site, path, canonical, practice, meta.service.fee);
		if (node) nodes.push(node);
	}
	if (path === '/') {
		// The home page is the practice's canonical description: both entities.
		nodes.push(practiceNode(site, practice), counselorNode(site, practice));
	} else if (nodes.length > 0) {
		nodes.push(practiceNode(site, practice));
	}

	return {
		title: overrides.title ?? meta.title,
		description,
		canonical,
		ogImage: new URL(meta.ogImage ?? DEFAULT_OG_IMAGE, site),
		jsonLd:
			nodes.length > 0
				? JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
				: null,
	};
}
