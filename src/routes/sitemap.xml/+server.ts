import { absoluteUrl } from '$lib/seo/site';
import { getProjectPageEntries } from '$lib/data/project-pages';
import type { RequestHandler } from './$types';

export const prerender = true;

type SitemapEntry = {
	path: string;
	changefreq: 'weekly' | 'monthly';
	priority: string;
};

const entries: SitemapEntry[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	...getProjectPageEntries().map(
		({ slug }): SitemapEntry => ({
			path: `/projects/${slug}`,
			changefreq: 'monthly',
			priority: '0.8'
		})
	)
];

export const GET: RequestHandler = () => {
	const urls = entries
		.map(
			(entry) =>
				`\t<url>\n` +
				`\t\t<loc>${absoluteUrl(entry.path)}</loc>\n` +
				`\t\t<changefreq>${entry.changefreq}</changefreq>\n` +
				`\t\t<priority>${entry.priority}</priority>\n` +
				`\t</url>`
		)
		.join('\n');

	const xml =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		`${urls}\n` +
		`</urlset>\n`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
