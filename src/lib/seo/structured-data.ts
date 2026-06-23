/**
 * Builders for the JSON-LD structured data emitted via the `Seo` component.
 * Search engines use these to understand the studio (an organization) and each
 * project page (a case study about a website the studio built).
 */
import { SITE, absoluteUrl } from '$lib/seo/site';
import type { ProjectPage } from '$lib/data/project-pages';

/** Stable `@id` for the organization node so other schemas can reference it. */
const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function organizationSchema(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': ['Organization', 'ProfessionalService'],
		'@id': ORGANIZATION_ID,
		name: SITE.name,
		url: SITE.url,
		description: SITE.description,
		logo: absoluteUrl('/favicon_io/android-chrome-512x512.png'),
		image: absoluteUrl(SITE.ogImage),
		slogan: 'Premium freelance web development',
		knowsAbout: [
			'Web development',
			'SvelteKit',
			'Frontend engineering',
			'Product design',
			'Data visualization'
		],
		areaServed: 'Worldwide'
	};
}

export function websiteSchema(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		name: SITE.name,
		url: SITE.url,
		description: SITE.description,
		publisher: { '@id': ORGANIZATION_ID },
		inLanguage: 'en'
	};
}

/** Case-study schema: a CreativeWork the studio authored about a live website. */
export function projectSchema(project: ProjectPage, path: string): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: project.name,
		headline: `${project.name} — built by ${SITE.name}`,
		description: project.metaDescription,
		url: absoluteUrl(path),
		image: absoluteUrl(SITE.ogImage),
		inLanguage: 'en',
		creator: { '@id': ORGANIZATION_ID },
		author: { '@id': ORGANIZATION_ID }
	};

	if (project.website) {
		// Point to the live product this case study documents.
		schema.about = {
			'@type': 'WebSite',
			name: project.name,
			url: project.website
		};
	}

	return schema;
}

/** Breadcrumb trail: Home › {project}. */
export function breadcrumbSchema(
	items: Array<{ name: string; path: string }>
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}
