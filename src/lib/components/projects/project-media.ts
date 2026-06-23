import {
	resolveProjectPreviewCarousel,
	type ResolvedProjectPreviewCarouselScene,
	type ResolvedProjectPreviewMobilePoster
} from '$lib/components/home/project-preview-assets';

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
	kind: 'image' | 'video' | 'text';
	surface: 'desktop' | 'mobile' | 'text';
	text: string | null;
	fit: 'cover' | 'contain';
	source: ProjectMediaItemSource | null;
	sourceUrl: string | null;
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

function mapSceneToMediaItem(scene: ResolvedProjectPreviewCarouselScene): ProjectMediaItem {
	return {
		id: scene.id,
		label: scene.label,
		kind: scene.kind,
		surface: scene.surface,
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

function createPosterMediaItem(poster: ResolvedProjectPreviewMobilePoster): ProjectMediaItem {
	return {
		id: 'mobile-poster',
		label: poster.label,
		kind: 'image',
		surface: getPosterSurface(poster),
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

export function getProjectMediaItems(projectId: string): ProjectMediaItem[] {
	const previewCarousel = resolveProjectPreviewCarousel(projectId);

	if (!previewCarousel) {
		return [];
	}

	const heroScene = pickHeroScene(previewCarousel.scenes);
	const projectMediaItems: ProjectMediaItem[] = [];

	if (heroScene) {
		projectMediaItems.push(mapSceneToMediaItem(heroScene));
	}

	if (
		previewCarousel.mobilePoster &&
		!previewCarousel.scenes.some((scene) => scene.sourceUrl === previewCarousel.mobilePoster?.url)
	) {
		projectMediaItems.push(createPosterMediaItem(previewCarousel.mobilePoster));
	}

	for (const scene of previewCarousel.scenes) {
		if (scene.id === heroScene?.id) {
			continue;
		}

		projectMediaItems.push(mapSceneToMediaItem(scene));
	}

	return projectMediaItems;
}
