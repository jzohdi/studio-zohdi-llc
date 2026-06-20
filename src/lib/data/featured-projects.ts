export type PreviewVariant = 'malibou' | 'zefir' | 'heysimon' | 'osol' | 'supercomics';
export type ProjectAccent = 'warm' | 'green' | 'cool' | 'sky' | 'violet';
export type ProjectStatus = 'live' | 'planned';

export type FeaturedProject = {
	id: string;
	name: string;
	/** Display title split into the lines it should break onto in the large desktop list. */
	nameLines: string[];
	summary: string;
	status: ProjectStatus;
	website?: string;
	previewLabel: string;
	previewVariant: PreviewVariant;
	accent: ProjectAccent;
};

export const featuredProjects: FeaturedProject[] = [
	{
		id: 'foia-search',
		name: 'FOIA SEARCH',
		nameLines: ['FOIA SEARCH'],
		summary: 'Live site: foiasearch.com',
		status: 'live',
		website: 'https://foiasearch.com',
		previewLabel: 'foia',
		previewVariant: 'zefir',
		accent: 'green'
	},
	{
		id: 'stock-promotion-tracker',
		name: 'STOCK PROMOTION TRACKER',
		nameLines: ['STOCK', 'PROMOTION', 'TRACKER'],
		summary: 'Live site: stockpromotiontracker.com',
		status: 'live',
		website: 'https://stockpromotiontracker.com',
		previewLabel: 'tracker',
		previewVariant: 'malibou',
		accent: 'warm'
	},
	{
		id: 'stop-nasdaq-china-fraud',
		name: 'STOP NASDAQ CHINA FRAUD',
		nameLines: ['STOP NASDAQ', 'CHINA FRAUD'],
		summary: 'Live site: stopnasdaqchinafraud.com',
		status: 'live',
		website: 'https://stopnasdaqchinafraud.com',
		previewLabel: 'fraud',
		previewVariant: 'supercomics',
		accent: 'violet'
	},
	{
		id: 'highgroundresearch',
		name: 'HIGH GROUND RESEARCH',
		nameLines: ['HIGH GROUND', 'RESEARCH'],
		summary: 'Live site: highgroundresearch.com',
		status: 'live',
		website: 'https://highgroundresearch.com',
		previewLabel: 'research',
		previewVariant: 'osol',
		accent: 'sky'
	},
	{
		id: 'greffier',
		name: 'GREFFIER',
		nameLines: ['GREFFIER'],
		summary: 'Local-first meeting transcription desktop app. Website coming later.',
		status: 'planned',
		previewLabel: 'greffier',
		previewVariant: 'heysimon',
		accent: 'cool'
	},
	{
		id: '8ksearch',
		name: '8KSEARCH',
		nameLines: ['8KSEARCH'],
		summary: 'Live site: 8ksearch.com',
		status: 'live',
		website: 'https://8ksearch.com',
		previewLabel: '8ksearch',
		previewVariant: 'zefir',
		accent: 'green'
	}
];

export const defaultFeaturedProjectId = 'foia-search';
