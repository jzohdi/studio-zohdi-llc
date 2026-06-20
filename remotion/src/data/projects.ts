import {
	featuredProjects,
	type FeaturedProject,
	type ProjectAccent
} from '../../../src/lib/data/featured-projects';

export type MotionPalette = {
	backgroundStart: string;
	backgroundEnd: string;
	glow: string;
	highlight: string;
	surface: string;
	border: string;
	label: string;
};

export type MotionProject = FeaturedProject & {
	palette: MotionPalette;
};

const accentPalettes: Record<ProjectAccent, MotionPalette> = {
	warm: {
		backgroundStart: '#fff6ef',
		backgroundEnd: '#efc6a9',
		glow: 'rgba(255, 141, 81, 0.34)',
		highlight: '#ff9461',
		surface: 'rgba(255, 249, 244, 0.84)',
		border: 'rgba(150, 94, 64, 0.18)',
		label: '#6e3d21'
	},
	green: {
		backgroundStart: '#eff8f1',
		backgroundEnd: '#c9e0ce',
		glow: 'rgba(88, 191, 116, 0.24)',
		highlight: '#4b9962',
		surface: 'rgba(246, 252, 247, 0.84)',
		border: 'rgba(70, 122, 82, 0.18)',
		label: '#244f30'
	},
	cool: {
		backgroundStart: '#eef1ff',
		backgroundEnd: '#d6dbff',
		glow: 'rgba(98, 114, 255, 0.28)',
		highlight: '#4d67ff',
		surface: 'rgba(245, 247, 255, 0.84)',
		border: 'rgba(86, 98, 176, 0.2)',
		label: '#2d3d92'
	},
	sky: {
		backgroundStart: '#eefcf8',
		backgroundEnd: '#d0eafb',
		glow: 'rgba(63, 184, 201, 0.26)',
		highlight: '#27a8d8',
		surface: 'rgba(244, 251, 251, 0.84)',
		border: 'rgba(52, 137, 148, 0.18)',
		label: '#1f5e70'
	},
	violet: {
		backgroundStart: '#4023f4',
		backgroundEnd: '#ff6fab',
		glow: 'rgba(255, 118, 176, 0.24)',
		highlight: '#ff69aa',
		surface: 'rgba(28, 17, 76, 0.52)',
		border: 'rgba(255, 255, 255, 0.16)',
		label: '#fff6ff'
	}
};

export const motionProjects: MotionProject[] = featuredProjects.map((project) => ({
	...project,
	palette: accentPalettes[project.accent]
}));

export const defaultMotionProjectId = motionProjects[0]?.id ?? 'foia-search';

export const getMotionProject = (projectId: string): MotionProject => {
	return motionProjects.find((project) => project.id === projectId) ?? motionProjects[0]!;
};
