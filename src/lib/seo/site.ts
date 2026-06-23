/**
 * Canonical site metadata shared by every page's `<head>` and the structured
 * data / sitemap builders. Keeping it in one place ensures titles, descriptions,
 * canonical URLs, and Open Graph tags stay consistent across the application.
 */
export const SITE = {
	url: 'https://studio-zohdi-llc.com',
	name: 'Studio Zohdi',
	/** Short title suffix appended to per-page titles. */
	titleSuffix: 'Studio Zohdi',
	defaultTitle: 'Studio Zohdi | Premium freelance web development',
	description:
		'Studio Zohdi is a premium freelance web development studio showcasing recent client work across product, commerce, creative, and energy experiences.',
	/** 1200×630 social share card, served from `static/`. */
	ogImage: '/og-image.png',
	ogImageAlt: 'Studio Zohdi — premium freelance web development',
	locale: 'en_US',
	twitterCard: 'summary_large_image'
} as const;

/** Resolve a site-relative path to an absolute URL on the canonical origin. */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//.test(path)) {
		return path;
	}

	return new URL(path, SITE.url).href;
}
