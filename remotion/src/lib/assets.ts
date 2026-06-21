import { staticFile } from 'remotion';
import {
	getMotionProject,
	mergeMotionPalette,
	motionProjects,
	type MotionPalette,
	type MotionProject
} from '../data/projects';

export type AssetKind = 'image' | 'video' | 'text';
export type MediaFit = 'cover' | 'contain';
export type SceneSurface = 'desktop' | 'mobile' | 'text';
export type SceneMediaType = 'screenshot' | 'recording' | 'text';
export type AssetCollectionName =
	| 'desktopScreenshots'
	| 'desktopScreenRecordings'
	| 'mobileScreenshots'
	| 'mobileScreenRecordings'
	| 'textFrames';

type AssetStringInput = string;

type AssetObjectInput = {
	path: string;
	durationInSeconds?: number;
	trimBeforeInSeconds?: number;
	fit?: MediaFit;
	label?: string;
};

export type ScreenshotAssetInput = AssetStringInput | AssetObjectInput;
export type RecordingAssetInput = AssetStringInput | AssetObjectInput;
export type TextFrameInput = {
	text: string;
	duration: number;
};

type TimelineReference = {
	collection: AssetCollectionName;
	index: number;
};

type ProjectAssetDefaults = {
	screenshotDurationInSeconds?: number;
	recordingDurationInSeconds?: number;
	transitionDurationInSeconds?: number;
};

type ResolvedProjectAssetDefaults = {
	screenshotDurationInSeconds: number;
	recordingDurationInSeconds: number;
	transitionDurationInSeconds: number;
};

export type ProjectAssetConfig = {
	projectId: string;
	palette?: Partial<MotionPalette>;
	defaults?: ProjectAssetDefaults;
	desktopScreenshots?: ScreenshotAssetInput[];
	desktopScreenRecordings?: RecordingAssetInput[];
	mobileScreenshots?: ScreenshotAssetInput[];
	mobileScreenRecordings?: RecordingAssetInput[];
	textFrames?: TextFrameInput[];
	textFrame?: TextFrameInput[];
	timeline?: TimelineReference[];
};

export type ResolvedProjectScene = {
	id: string;
	kind: AssetKind;
	src: string | null;
	path: string | null;
	label: string;
	text: string | null;
	surface: SceneSurface;
	mediaType: SceneMediaType;
	fit: MediaFit;
	durationInFrames: number;
	trimBeforeInFrames: number;
	trimAfterInFrames?: number;
	collection: AssetCollectionName;
	collectionIndex: number;
};

export type ProjectTimeline = {
	project: MotionProject;
	palette: MotionPalette;
	scenes: ResolvedProjectScene[];
	transitionDurationInFrames: number;
	totalDurationInFrames: number;
	anyRealAsset: boolean;
};

const calculateSequenceDurationInFrames = (
	scenes: ResolvedProjectScene[],
	transitionDurationInFrames: number
): number => {
	return scenes.reduce((total, scene, index) => {
		const overlap = index === 0 ? 0 : transitionDurationInFrames;

		return total + scene.durationInFrames - overlap;
	}, 0);
};

const defaultTimings = {
	screenshotDurationInSeconds: 1.8,
	recordingDurationInSeconds: 3.2,
	transitionDurationInSeconds: 0.6
} as const;

const collectionOrder: AssetCollectionName[] = [
	'desktopScreenshots',
	'mobileScreenshots',
	'desktopScreenRecordings',
	'mobileScreenRecordings',
	'textFrames'
];

const sceneLabels: Record<AssetCollectionName, string> = {
	desktopScreenshots: 'Desktop Screenshot',
	desktopScreenRecordings: 'Desktop Recording',
	mobileScreenshots: 'Mobile Screenshot',
	mobileScreenRecordings: 'Mobile Recording',
	textFrames: 'Text Frame'
};

const normalizeAssetPath = (value: string): string => {
	const normalized = value.replace(/\\/g, '/').trim().replace(/^\.?\//, '');

	return normalized.startsWith('http://') || normalized.startsWith('https://')
		? normalized
		: normalized.replace(/^\/+/, '');
};

const resolveAssetSrc = (value: string): string => {
	const normalized = normalizeAssetPath(value);

	return normalized.startsWith('http://') || normalized.startsWith('https://')
		? normalized
		: staticFile(normalized);
};

const toFrames = (seconds: number, fps: number): number => {
	return Math.max(1, Math.round(seconds * fps));
};

const resolveDurationInFrames = (
	input: AssetObjectInput | undefined,
	fallbackDurationInSeconds: number,
	fps: number
): number => {
	return toFrames(input?.durationInSeconds ?? fallbackDurationInSeconds, fps);
};

const resolveTrimBeforeInFrames = (input: AssetObjectInput | undefined, fps: number): number => {
	return input?.trimBeforeInSeconds ? toFrames(input.trimBeforeInSeconds, fps) : 0;
};

const toAssetObject = (input: ScreenshotAssetInput | RecordingAssetInput): AssetObjectInput => {
	if (typeof input === 'string') {
		return { path: input };
	}

	return input;
};

const getCollectionSurface = (collection: AssetCollectionName): SceneSurface => {
	if (collection === 'textFrames') {
		return 'text';
	}

	return collection.startsWith('desktop') ? 'desktop' : 'mobile';
};

const getCollectionMediaType = (collection: AssetCollectionName): SceneMediaType => {
	if (collection === 'textFrames') {
		return 'text';
	}

	return collection.includes('Recordings') ? 'recording' : 'screenshot';
};

const createSceneLabel = (
	collection: AssetCollectionName,
	index: number,
	customLabel?: string
): string => {
	return customLabel ?? `${sceneLabels[collection]} ${String(index + 1).padStart(2, '0')}`;
};

const buildResolvedScene = (
	collection: AssetCollectionName,
	index: number,
	input: ScreenshotAssetInput | RecordingAssetInput,
	fps: number,
	defaults: ResolvedProjectAssetDefaults
): ResolvedProjectScene => {
	const assetObject = toAssetObject(input);
	const mediaType = getCollectionMediaType(collection);
	const durationInFrames = resolveDurationInFrames(
		assetObject,
		mediaType === 'recording'
			? defaults.recordingDurationInSeconds
			: defaults.screenshotDurationInSeconds,
		fps
	);
	const trimBeforeInFrames = resolveTrimBeforeInFrames(assetObject, fps);
	const path = normalizeAssetPath(assetObject.path);

	return {
		id: `${collection}-${index}`,
		kind: mediaType === 'recording' ? 'video' : 'image',
		src: resolveAssetSrc(path),
		path,
		label: createSceneLabel(collection, index, assetObject.label),
		text: null,
		surface: getCollectionSurface(collection),
		mediaType,
		fit: assetObject.fit ?? 'cover',
		durationInFrames,
		trimBeforeInFrames,
		trimAfterInFrames:
			mediaType === 'recording' ? trimBeforeInFrames + durationInFrames : undefined,
		collection,
		collectionIndex: index
	};
};

const buildResolvedTextScene = (
	index: number,
	input: TextFrameInput,
	fps: number
): ResolvedProjectScene => {
	return {
		id: `textFrames-${index}`,
		kind: 'text',
		src: null,
		path: null,
		label: createSceneLabel('textFrames', index),
		text: input.text,
		surface: 'text',
		mediaType: 'text',
		fit: 'contain',
		durationInFrames: toFrames(input.duration, fps),
		trimBeforeInFrames: 0,
		collection: 'textFrames',
		collectionIndex: index
	};
};

const buildAutoTimeline = (
	collections: Record<AssetCollectionName, ResolvedProjectScene[]>
): TimelineReference[] => {
	const references: TimelineReference[] = [];
	const maxLength = Math.max(...collectionOrder.map((collection) => collections[collection].length), 0);

	for (let index = 0; index < maxLength; index += 1) {
		for (const collection of collectionOrder) {
			if (collections[collection][index]) {
				references.push({ collection, index });
			}
		}
	}

	return references;
};

const fallbackScenes = (fps: number): ResolvedProjectScene[] => [
	{
		id: 'placeholder-desktop',
		kind: 'image',
		src: null,
		path: null,
		label: 'Desktop Screenshot 01',
		text: null,
		surface: 'desktop',
		mediaType: 'screenshot',
		fit: 'cover',
		durationInFrames: toFrames(defaultTimings.screenshotDurationInSeconds, fps),
		trimBeforeInFrames: 0,
		collection: 'desktopScreenshots',
		collectionIndex: 0
	},
	{
		id: 'placeholder-mobile',
		kind: 'image',
		src: null,
		path: null,
		label: 'Mobile Screenshot 01',
		text: null,
		surface: 'mobile',
		mediaType: 'screenshot',
		fit: 'cover',
		durationInFrames: toFrames(defaultTimings.screenshotDurationInSeconds, fps),
		trimBeforeInFrames: 0,
		collection: 'mobileScreenshots',
		collectionIndex: 0
	}
];

const getProjectAssetConfig = (projectId: string): ProjectAssetConfig | null => {
	return (
		Object.values(projectAssetManifest).find((entry) => {
			return entry.projectId === projectId;
		}) ?? null
	);
};

const getTransitionDurationInFrames = (config: ProjectAssetConfig | null, fps: number): number => {
	return toFrames(
		config?.defaults?.transitionDurationInSeconds ?? defaultTimings.transitionDurationInSeconds,
		fps
	);
};

export const projectAssetManifest = {
	foiaSearch: {
		projectId: 'foia-search',
		palette: {
			backgroundStart: '#edf8f7',
			backgroundEnd: '#d7ebe6',
			glow: 'rgba(17, 140, 122, 0.24)',
			highlight: '#118c7a',
			surface: 'rgba(244, 251, 249, 0.84)',
			border: 'rgba(17, 97, 93, 0.18)',
			label: '#124c4a'
		},
		defaults: {
			screenshotDurationInSeconds: 1.9,
			transitionDurationInSeconds: 0.7
		},
		desktopScreenshots: [
			{
				path: 'projects/foia-search/desktop_1.png',
				durationInSeconds: 3.2,
				fit: 'contain',
				label: 'Homepage Overview'
			},
			{
				path: 'projects/foia-search/desktop_2.png',
				durationInSeconds: 4.2,
				fit: 'contain',
				label: 'Search Results Detail'
			}
		],
		desktopScreenRecordings: [
			{
				path: 'projects/foia-search/desktop_recording_1.mp4',
				durationInSeconds: 6,
				fit: 'contain',
				label: 'Instantly Find B7A Requests'
			}
		],
		mobileScreenshots: [
			{
				path: 'projects/foia-search/mobile_1.png',
				durationInSeconds: 3.2,
				fit: 'contain',
				label: 'Mobile Results View'
			},
			{
				path: 'projects/foia-search/mobile_2.png',
				durationInSeconds: 4.2,
				fit: 'contain',
				label: 'Email Alerts Based on Search Results'
			}
		],
		mobileScreenRecordings: [],
		textFrames: [{ text: 'Find Ongoing SEC Investigations', duration: 1.6 }, {
			text: 'Instantly Query All FOIA Requests',
			duration: 1.6
		}, {
			text: "Recieve Email Alerts When New Requests Match Your Search",
			duration: 1.6
		}],
		timeline: [
			{ collection: 'textFrames', index: 0 },
			{ collection: 'mobileScreenshots', index: 0 },
			{ collection: 'textFrames', index: 1 },
			{ collection: 'desktopScreenRecordings', index: 0 },
			{ collection: 'textFrames', index: 2 },
			{ collection: 'mobileScreenshots', index: 1 }
		]
	},
	stockPromotionTracker: {
		projectId: 'stock-promotion-tracker',
		desktopScreenshots: [],
		desktopScreenRecordings: [],
		mobileScreenshots: [],
		mobileScreenRecordings: []
	},
	stopNasdaqChinaFraud: {
		projectId: 'stop-nasdaq-china-fraud',
		desktopScreenshots: [],
		desktopScreenRecordings: [],
		mobileScreenshots: [],
		mobileScreenRecordings: []
	},
	highGroundResearch: {
		projectId: 'highgroundresearch',
		desktopScreenshots: [],
		desktopScreenRecordings: [],
		mobileScreenshots: [],
		mobileScreenRecordings: []
	},
	greffier: {
		projectId: 'greffier',
		desktopScreenshots: [],
		desktopScreenRecordings: [],
		mobileScreenshots: [],
		mobileScreenRecordings: []
	},
	search8k: {
		projectId: '8ksearch',
		desktopScreenshots: [],
		desktopScreenRecordings: [],
		mobileScreenshots: [],
		mobileScreenRecordings: []
	}
} satisfies Record<string, ProjectAssetConfig>;

export const getProjectTimeline = (projectId: string, fps: number): ProjectTimeline => {
	const project = getMotionProject(projectId);
	const config = getProjectAssetConfig(projectId);
	const configuredTextFrames = config?.textFrames ?? config?.textFrame ?? [];
	const timings = {
		screenshotDurationInSeconds:
			config?.defaults?.screenshotDurationInSeconds ?? defaultTimings.screenshotDurationInSeconds,
		recordingDurationInSeconds:
			config?.defaults?.recordingDurationInSeconds ?? defaultTimings.recordingDurationInSeconds,
		transitionDurationInSeconds:
			config?.defaults?.transitionDurationInSeconds ?? defaultTimings.transitionDurationInSeconds
	};

	const collections: Record<AssetCollectionName, ResolvedProjectScene[]> = {
		desktopScreenshots: (config?.desktopScreenshots ?? []).map((asset, index) =>
			buildResolvedScene('desktopScreenshots', index, asset, fps, timings)
		),
		desktopScreenRecordings: (config?.desktopScreenRecordings ?? []).map((asset, index) =>
			buildResolvedScene('desktopScreenRecordings', index, asset, fps, timings)
		),
		mobileScreenshots: (config?.mobileScreenshots ?? []).map((asset, index) =>
			buildResolvedScene('mobileScreenshots', index, asset, fps, timings)
		),
		mobileScreenRecordings: (config?.mobileScreenRecordings ?? []).map((asset, index) =>
			buildResolvedScene('mobileScreenRecordings', index, asset, fps, timings)
		),
		textFrames: configuredTextFrames.map((frame, index) => buildResolvedTextScene(index, frame, fps))
	};

	const timelineReferences = config?.timeline?.length ? config.timeline : buildAutoTimeline(collections);
	const scenes = timelineReferences
		.map((reference) => collections[reference.collection][reference.index] ?? null)
		.filter((scene): scene is ResolvedProjectScene => Boolean(scene));
	const normalizedScenes = scenes.length > 0 ? scenes : fallbackScenes(fps);
	const maxTransitionDurationInFrames =
		normalizedScenes.length > 1
			? Math.max(
				0,
				Math.min(...normalizedScenes.map((scene) => Math.max(1, scene.durationInFrames - 1)))
			)
			: 0;
	const transitionDurationInFrames = Math.min(
		getTransitionDurationInFrames(config, fps),
		maxTransitionDurationInFrames
	);
	const totalDurationInFrames = calculateSequenceDurationInFrames(
		normalizedScenes,
		transitionDurationInFrames
	);

	return {
		project,
		palette: mergeMotionPalette(project.palette, config?.palette),
		scenes: normalizedScenes,
		transitionDurationInFrames,
		totalDurationInFrames,
		anyRealAsset: scenes.length > 0
	};
};

export const getLoopedProjectScenes = (scenes: ResolvedProjectScene[]): ResolvedProjectScene[] => {
	if (scenes.length < 2) {
		return scenes;
	}

	const firstScene = scenes[0];

	return [
		...scenes,
		{
			...firstScene,
			id: `${firstScene.id}-loop-return`
		}
	];
};

export const getProjectSceneStartFrames = (
	scenes: ResolvedProjectScene[],
	transitionDurationInFrames: number
): number[] => {
	let cursor = 0;

	return scenes.map((scene, index) => {
		const start = cursor;
		const overlap = index === scenes.length - 1 ? 0 : transitionDurationInFrames;
		cursor += scene.durationInFrames - overlap;

		return start;
	});
};

export const getPortfolioOverviewDurationInFrames = (fps: number): number => {
	return motionProjects.reduce((total, project) => {
		return total + getProjectTimeline(project.id, fps).totalDurationInFrames;
	}, 0);
};

export const getProjectPreviewDurationInFrames = (projectId: string, fps: number): number => {
	const timeline = getProjectTimeline(projectId, fps);

	return calculateSequenceDurationInFrames(
		getLoopedProjectScenes(timeline.scenes),
		timeline.transitionDurationInFrames
	);
};
