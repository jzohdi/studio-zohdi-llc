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

export type ProjectMediaItem = {
	id: string;
	label: string;
	kind: 'image' | 'video' | 'text' | 'logo';
	surface: 'desktop' | 'mobile' | 'text';
	mediaType: 'screenshot' | 'recording' | 'text';
	span: ProjectMediaSpan;
	text: string | null;
	fit: 'cover' | 'contain';
	source: ProjectMediaItemSource | null;
	sourceUrl: string | null;
};

/**
 * Per-project curated bento layouts. When a project is listed here its detail-page
 * bento is built from these entries (in order) instead of the auto-generated layout,
 * giving us full control over which media appears and how each tile spans the grid.
 */
type CuratedBentoEntry =
	| { kind: 'scene'; sceneId: string; span: ProjectMediaSpan }
	| { kind: 'logo'; span: ProjectMediaSpan };

const curatedProjectBento: Record<string, CuratedBentoEntry[]> = {
	'foia-search': [
		{ kind: 'scene', sceneId: 'desktopScreenRecordings-0', span: 'full' },
		{ kind: 'logo', span: 'half' },
		{ kind: 'scene', sceneId: 'mobileScreenRecordings-0', span: 'half' },
		{ kind: 'scene', sceneId: 'desktopScreenRecordings-1', span: 'full' }
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
		sourceUrl: scene.sourceUrl
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
		sourceUrl: poster.url
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
		sourceUrl: asset(logoPath as AssetPath)
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

		const scene = sceneById.get(entry.sceneId);

		if (scene?.sourceUrl) {
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
