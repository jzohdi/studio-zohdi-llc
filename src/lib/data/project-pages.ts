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
			'FOIA Search helps users see related SEC FOIA activity for companies and organizations. It highlights B7A exemptions, investigation-related requests, and alert-oriented workflows for portfolios, IR teams, and reporter monitoring.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(172, 78%, 42%)' }
	},
	'stock-promotion-tracker': {
		infoParagraphs: [
			'Stock Promotion Tracker is a research platform for monitoring paid stock promotion disclosures, promoted companies, and campaign activity across multiple sources. The product emphasizes hourly updates, filters, risk context, and price-performance analysis.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(271, 81%, 60%)' }
	},
	'stop-nasdaq-china-fraud': {
		infoParagraphs: [
			'Stop Nasdaq China Fraud is a public evidence hub focused on pump-and-dump schemes involving U.S.-listed Chinese stocks. It invites users to upload suspicious WhatsApp screenshots and helps surface evidence that warns other investors.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(217, 91%, 60%)' }
	},
	highgroundresearch: {
		infoParagraphs: [
			'Highground Research is a prediction-market analytics product for Polymarket and Kalshi. It combines smart-money scanning, local-first personal analytics, market monitoring, and top-trader research in one interface.'
		],
		titleHighlight: { primary: 'hsl(25, 95%, 53%)', secondary: SITE_PINK }
	},
	'8ksearch': {
		infoParagraphs: [
			'8Ksearch helps users search high-risk 8-K filings with live updates and flexible filters. The experience is built for scanning company filings by market cap, date range, and filing type.'
		],
		titleHighlight: { primary: SITE_PINK, secondary: 'hsl(217, 91%, 60%)' }
	},
	greffier: {
		infoParagraphs: [
			'Greffier is a local-first meeting transcription desktop app currently in development.'
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
