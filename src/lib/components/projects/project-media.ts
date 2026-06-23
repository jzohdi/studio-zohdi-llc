import { asset } from '$app/paths';
import {
	resolveProjectPreviewCarousel,
	type ResolvedProjectPreviewCarouselScene,
	type ResolvedProjectPreviewMobilePoster
} from '$lib/components/home/project-preview-assets';

type AssetPath = Parameters<typeof asset>[0];

export type ProjectMediaSpan = 'full' | 'half';

export type ProjectMediaItemSource = {
	path: string;
	type: string;
	width: number | null;
	height: number | null;
	aspectRatio: number | null;
};

/** Payload for a click-to-load YouTube tile. */
export type ProjectMediaYouTube = {
	videoId: string;
	startSeconds: number | null;
	caption: string | null;
};

/** Payload for an interactive globe tile. */
export type ProjectMediaGlobe = {
	title: string;
};

/** Identifies which animated graphic a `graphic` tile should render. */
export type ProjectMediaGraphicId = 'ddos';

/** Payload for an animated graphic tile. */
export type ProjectMediaGraphic = {
	id: ProjectMediaGraphicId;
};

/**
 * Controls how a `text` tile is typeset: `display` is the oversized centered
 * callout used for short phrases, `statement` is a smaller left-aligned block
 * that reads well for longer sentences.
 */
export type ProjectMediaTextVariant = 'display' | 'statement';

export type ProjectMediaItem = {
	id: string;
	label: string;
	kind: 'image' | 'video' | 'text' | 'logo' | 'youtube' | 'globe' | 'graphic';
	surface: 'desktop' | 'mobile' | 'text' | 'embed';
	mediaType: 'screenshot' | 'recording' | 'text' | 'embed';
	span: ProjectMediaSpan;
	text: string | null;
	textVariant: ProjectMediaTextVariant | null;
	fit: 'cover' | 'contain';
	source: ProjectMediaItemSource | null;
	sourceUrl: string | null;
	youtube: ProjectMediaYouTube | null;
	globe: ProjectMediaGlobe | null;
	graphic: ProjectMediaGraphic | null;
};

/**
 * Per-project curated bento layouts. When a project is listed here its detail-page
 * bento is built from these entries (in order) instead of the auto-generated layout,
 * giving us full control over which media appears and how each tile spans the grid.
 */
type CuratedBentoEntry =
	| { kind: 'scene'; sceneId: string; span: ProjectMediaSpan }
	| { kind: 'logo'; span: ProjectMediaSpan }
	| {
			kind: 'youtube';
			videoId: string;
			startSeconds?: number;
			caption: string;
			span: ProjectMediaSpan;
	  }
	| { kind: 'globe'; title: string; span: ProjectMediaSpan }
	| { kind: 'text'; text: string; variant?: ProjectMediaTextVariant; span: ProjectMediaSpan }
	| { kind: 'graphic'; graphic: ProjectMediaGraphicId; label: string; span: ProjectMediaSpan };

const curatedProjectBento: Record<string, CuratedBentoEntry[]> = {
	'foia-search': [
		{ kind: 'scene', sceneId: 'desktopScreenRecordings-0', span: 'full' },
		{ kind: 'logo', span: 'half' },
		{ kind: 'scene', sceneId: 'mobileScreenRecordings-0', span: 'half' },
		{ kind: 'scene', sceneId: 'desktopScreenRecordings-1', span: 'full' }
	],
	'stock-promotion-tracker': [
		{ kind: 'scene', sceneId: 'desktopScreenshots-0', span: 'full' },
		{ kind: 'scene', sceneId: 'mobileScreenshots-0', span: 'half' },
		{ kind: 'scene', sceneId: 'textFrames-2', span: 'half' },
		{ kind: 'scene', sceneId: 'desktopScreenRecordings-0', span: 'full' }
	],
	'stop-nasdaq-china-fraud': [
		{
			kind: 'youtube',
			videoId: 'dJ2nr4Q-Ptk',
			startSeconds: 1014,
			caption:
				'Referenced during a hearing with the SEC while reviewing Nasdaq pump-and-dump activity',
			span: 'full'
		},
		{ kind: 'globe', title: 'API used by investors globally', span: 'half' },
		{ kind: 'scene', sceneId: 'mobileScreenRecordings-0', span: 'half' },
		{
			kind: 'text',
			text: 'DDoS mitigation and prevention against frequent, sometimes daily, attacks kept the application alive even during the worst efforts.',
			span: 'half'
		},
		{
			kind: 'graphic',
			graphic: 'ddos',
			label:
				'Animated diagram of distributed denial-of-service attacks being absorbed by a mitigation shield',
			span: 'half'
		}
	]
};

const projectLogoPaths: Record<string, string> = {
	'foia-search': '/project-logos/foia-search.svg'
};

function pickHeroScene(
	scenes: ResolvedProjectPreviewCarouselScene[]
): ResolvedProjectPreviewCarouselScene | null {
	return (
		scenes.find((scene) => scene.sourceUrl && scene.surface === 'desktop') ??
		scenes.find((scene) => scene.sourceUrl) ??
		null
	);
}

function getPosterSurface(poster: ResolvedProjectPreviewMobilePoster): ProjectMediaItem['surface'] {
	return poster.aspectRatio !== null && poster.aspectRatio < 0.9 ? 'mobile' : 'desktop';
}

function mapSceneToMediaItem(
	scene: ResolvedProjectPreviewCarouselScene,
	span: ProjectMediaSpan
): ProjectMediaItem {
	return {
		id: scene.id,
		label: scene.label,
		kind: scene.kind,
		surface: scene.surface,
		mediaType: scene.mediaType,
		span,
		text: scene.text,
		fit: scene.fit,
		source: scene.source
			? {
					path: scene.source.path,
					type: scene.source.type,
					width: scene.source.width,
					height: scene.source.height,
					aspectRatio: scene.source.aspectRatio
				}
			: null,
		sourceUrl: scene.sourceUrl,
		youtube: null,
		globe: null,
		textVariant: null,
		graphic: null
	};
}

function createPosterMediaItem(
	poster: ResolvedProjectPreviewMobilePoster,
	span: ProjectMediaSpan
): ProjectMediaItem {
	return {
		id: 'mobile-poster',
		label: poster.label,
		kind: 'image',
		surface: getPosterSurface(poster),
		mediaType: 'screenshot',
		span,
		text: null,
		fit: poster.fit,
		source: {
			path: poster.path,
			type: poster.type,
			width: poster.width,
			height: poster.height,
			aspectRatio: poster.aspectRatio
		},
		sourceUrl: poster.url,
		youtube: null,
		globe: null,
		textVariant: null,
		graphic: null
	};
}

function createLogoMediaItem(projectId: string, span: ProjectMediaSpan): ProjectMediaItem | null {
	const logoPath = projectLogoPaths[projectId];

	if (!logoPath) {
		return null;
	}

	return {
		id: `logo-${projectId}`,
		label: '',
		kind: 'logo',
		surface: 'text',
		mediaType: 'text',
		span,
		text: null,
		fit: 'contain',
		source: null,
		sourceUrl: asset(logoPath as AssetPath),
		youtube: null,
		globe: null,
		textVariant: null,
		graphic: null
	};
}

function createYouTubeMediaItem(
	entry: Extract<CuratedBentoEntry, { kind: 'youtube' }>
): ProjectMediaItem {
	return {
		id: `youtube-${entry.videoId}`,
		label: entry.caption,
		kind: 'youtube',
		surface: 'embed',
		mediaType: 'embed',
		span: entry.span,
		text: null,
		fit: 'contain',
		source: null,
		sourceUrl: null,
		youtube: {
			videoId: entry.videoId,
			startSeconds: entry.startSeconds ?? null,
			caption: entry.caption
		},
		globe: null,
		textVariant: null,
		graphic: null
	};
}

function createGlobeMediaItem(
	entry: Extract<CuratedBentoEntry, { kind: 'globe' }>
): ProjectMediaItem {
	return {
		id: 'globe',
		label: entry.title,
		kind: 'globe',
		surface: 'embed',
		mediaType: 'embed',
		span: entry.span,
		text: null,
		fit: 'contain',
		source: null,
		sourceUrl: null,
		youtube: null,
		globe: { title: entry.title },
		textVariant: null,
		graphic: null
	};
}

function createTextMediaItem(
	entry: Extract<CuratedBentoEntry, { kind: 'text' }>
): ProjectMediaItem {
	return {
		id: `text-${entry.text.slice(0, 24)}`,
		label: entry.text,
		kind: 'text',
		surface: 'text',
		mediaType: 'text',
		span: entry.span,
		text: entry.text,
		textVariant: entry.variant ?? 'statement',
		fit: 'contain',
		source: null,
		sourceUrl: null,
		youtube: null,
		globe: null,
		graphic: null
	};
}

function createGraphicMediaItem(
	entry: Extract<CuratedBentoEntry, { kind: 'graphic' }>
): ProjectMediaItem {
	return {
		id: `graphic-${entry.graphic}`,
		label: entry.label,
		kind: 'graphic',
		surface: 'embed',
		mediaType: 'embed',
		span: entry.span,
		text: null,
		textVariant: null,
		fit: 'contain',
		source: null,
		sourceUrl: null,
		youtube: null,
		globe: null,
		graphic: { id: entry.graphic }
	};
}

function getCuratedMediaItems(
	projectId: string,
	scenes: ResolvedProjectPreviewCarouselScene[]
): ProjectMediaItem[] | null {
	const curatedEntries = curatedProjectBento[projectId];

	if (!curatedEntries) {
		return null;
	}

	const sceneById = new Map(scenes.map((scene) => [scene.id, scene] as const));
	const curatedItems: ProjectMediaItem[] = [];

	for (const entry of curatedEntries) {
		if (entry.kind === 'logo') {
			const logoItem = createLogoMediaItem(projectId, entry.span);

			if (logoItem) {
				curatedItems.push(logoItem);
			}

			continue;
		}

		if (entry.kind === 'youtube') {
			curatedItems.push(createYouTubeMediaItem(entry));
			continue;
		}

		if (entry.kind === 'globe') {
			curatedItems.push(createGlobeMediaItem(entry));
			continue;
		}

		if (entry.kind === 'text') {
			curatedItems.push(createTextMediaItem(entry));
			continue;
		}

		if (entry.kind === 'graphic') {
			curatedItems.push(createGraphicMediaItem(entry));
			continue;
		}

		const scene = sceneById.get(entry.sceneId);

		if (scene && (scene.kind === 'text' || scene.sourceUrl)) {
			curatedItems.push(mapSceneToMediaItem(scene, entry.span));
		}
	}

	return curatedItems;
}

export function getProjectMediaItems(projectId: string): ProjectMediaItem[] {
	const previewCarousel = resolveProjectPreviewCarousel(projectId);

	if (!previewCarousel) {
		return [];
	}

	const curatedItems = getCuratedMediaItems(projectId, previewCarousel.scenes);

	if (curatedItems) {
		return curatedItems;
	}

	const heroScene = pickHeroScene(previewCarousel.scenes);
	const projectMediaItems: ProjectMediaItem[] = [];

	if (heroScene) {
		projectMediaItems.push(mapSceneToMediaItem(heroScene, 'full'));
	}

	if (
		previewCarousel.mobilePoster &&
		!previewCarousel.scenes.some((scene) => scene.sourceUrl === previewCarousel.mobilePoster?.url)
	) {
		projectMediaItems.push(createPosterMediaItem(previewCarousel.mobilePoster, 'half'));
	}

	for (const scene of previewCarousel.scenes) {
		if (scene.id === heroScene?.id) {
			continue;
		}

		projectMediaItems.push(mapSceneToMediaItem(scene, 'half'));
	}

	return projectMediaItems;
}
