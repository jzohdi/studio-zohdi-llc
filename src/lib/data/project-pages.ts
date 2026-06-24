import { featuredProjects, type FeaturedProject } from '$lib/data/featured-projects';

export const projectPageSlugs = [
	'foia-search',
	'stock-promotion-tracker',
	'stop-nasdaq-china-fraud',
	'highgroundresearch',
	'greffier',
	'8ksearch'
] as const;

export type ProjectPageSlug = (typeof projectPageSlugs)[number];

/** Two-color palette used by the animated project title outline highlight. */
export type ProjectTitleHighlight = {
	primary: string;
	secondary: string;
};

type ProjectPageCopy = {
	infoParagraphs: readonly [string, ...string[]];
	titleHighlight: ProjectTitleHighlight;
};

/** Studio Zohdi primary brand pink, mirrored from the `--pink` token in app.css. */
const SITE_PINK = 'hsl(318, 78%, 53%)';

const projectPageCopy: Record<ProjectPageSlug, ProjectPageCopy> = {
	'foia-search': {
		infoParagraphs: [
			`Helps users inspect SEC FOIA activity for companies and by organizations, for example.` +
			` B7A excemptions are particularly interesting as these are correlated with ongoing SEC investigations.` +
			` The SEC releases FOIA requests each month as CSV files, which are automatically parsed by site.`,
			`Customers receive monthly alerts containing requests that match their search criteria.` +
			` Investor relations teams monitor their companies, investors get alerted if their portfolio might be impacted, and a wide range of use cases` +
			` are supported by following activty by prominent journalists. This allows users to find news before it is widely reported.`
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(172, 78%, 42%)' }
	},
	'stock-promotion-tracker': {
		infoParagraphs: [
			'A research platform for monitoring paid stock promotion disclosures, promoted companies, and campaign activity across multiple sources.' +
			' Hedge funds, researchers, and retail investors use the site to monitor company activity and identify potential investment opportunities.' +
			' For example, paid stock promotions may* indicate  that a company is overvalued due to synthetically inflated positive media coverage.',
			' Other features include: Performance analysis that shows the impact of paid stock promotions on a company\'s stock price over time.' +
			' API access for custom integrations. PDF exports for internal memos.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(271, 81%, 60%)' }
	},
	'stop-nasdaq-china-fraud': {
		infoParagraphs: [
			'A crowd sourced hub focused on pump-and-dump schemes involving U.S. listed Chinese stocks.' +
			' It invites users to upload screenshots of suspicious messages (typically from WhatsApp) and helps surface evidence that warns other investors.',
			' Victims of these elaborate scams have lost <a href="https://www.afr.com/world/asia/billions-lost-on-us-penny-stocks-as-pump-and-dump-scams-multiply-20250818-p5mnup" target="_blank" rel="noreferrer noopener">billions</a> of dollars.' +
			' Users of the site have shared their truly heartbreaking stories of their situation and the impact on their lives.',
			' Hedge funds and retail investors use the site to monitor company activity for a range of use cases including' +
			' identifying high risk stocks and preventing active trading.' +
			' The API allows for custom integrations which is used by firms in the U.S. Europe, and Asia.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(217, 91%, 60%)' }
	},
	highgroundresearch: {
		infoParagraphs: [
			'A prediction market analytics product for Polymarket and Kalshi. It combines various frontier strategies including:',
			' <strong>Local first personal analytics</strong> platform powered by DuckDB WASM. This feature allows users to upload their trading history and analyze their own trading data.' +
			' The displayed insights, such as Yes vs No pricing based ROI, show users where their strength or weaknesses lie.',
			' <strong>Smart money scanning</strong>, which identifies when sharp money is lopsided to one side of a market outcome. Find where the smart money is trading against dumb money, and potentially uncovering insider trading.',
			' <strong>Market monitoring</strong> allows users to track changes in kalshi and polymarket events, such as volume anomalies and price shifts.' +
			' Users configure alerts and how the want to be notified using an intuitive interface.',
			' <strong>Top trader research</strong> provides a list of active traders on polymarket with at least $1M lifetime profit.' +
			' This allows users to follow activity for strategy insights and see where the top traders are holding positions that agree with each other.'
		],
		titleHighlight: { primary: 'hsl(25, 95%, 53%)', secondary: SITE_PINK }
	},
	'8ksearch': {
		infoParagraphs: [
			'Helps users search for 8-K filings through the SEC with live updates and flexible filters.' +
			' The experience is built for scanning company filings by market cap, date range, filing type, and more.',
			' Investors use the site to monitor for possibly high impact fillings such as: ' +
			' <strong>Corporate Governance Changes:</strong> Departure or appointment of key executives (CEOs, CFOs).' +
			' <strong>Material Financial Shifts</strong>: Entering or defaulting on material obligations, major acquisitions/dispositions of assets, etc.' +
			' <strong>Restructuring & Bankruptcy</strong>: Costs associated with plant shutdowns, large-scale layoffs, or bankruptcy and receivership filings.' +
			' <strong>Regulatory Compliance</strong>: Delisting from stock exchanges or suspensions under employee benefit plans' +
			' ...and more'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(217, 91%, 60%)' }
	},
	greffier: {
		infoParagraphs: [
			'A local-first meeting transcription desktop app currently in development.' +
			' With the rise of capabilities in open and light models, use cases for local first AI assistants are exploding.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(48, 96%, 53%)' }
	}
};

export type ProjectPage = FeaturedProject & {
	slug: ProjectPageSlug;
	infoParagraphs: readonly [string, ...string[]];
	titleHighlight: ProjectTitleHighlight;
	availabilityLabel: 'Live website' | 'In development';
	websiteLabel: 'Visit website' | 'Website coming soon';
	metaDescription: string;
};

const featuredProjectsById = new Map(
	featuredProjects.map((project) => [project.id, project] as const)
);

function requireFeaturedProject(slug: ProjectPageSlug): FeaturedProject {
	const project = featuredProjectsById.get(slug);

	if (!project) {
		throw new Error(`Missing featured project metadata for "${slug}"`);
	}

	return project;
}

export const projectPages: ProjectPage[] = projectPageSlugs.map((slug) => {
	const featuredProject = requireFeaturedProject(slug);
	const copy = projectPageCopy[slug];

	return {
		...featuredProject,
		slug,
		infoParagraphs: copy.infoParagraphs,
		titleHighlight: copy.titleHighlight,
		availabilityLabel: featuredProject.website ? 'Live website' : 'In development',
		websiteLabel: featuredProject.website ? 'Visit website' : 'Website coming soon',
		metaDescription: copy.infoParagraphs[0]
	};
});

const projectPagesBySlug = new Map(projectPages.map((project) => [project.slug, project] as const));

export function getProjectPage(slug: string): ProjectPage | null {
	return projectPagesBySlug.get(slug as ProjectPageSlug) ?? null;
}

export function getProjectPageEntries(): Array<{ slug: ProjectPageSlug }> {
	return projectPages.map(({ slug }) => ({ slug }));
}
