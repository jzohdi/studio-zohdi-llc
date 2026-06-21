import { asset } from '$app/paths';
import {
	getProjectPreviewCarousel,
	type ProjectPreviewCarouselAsset,
	type ProjectPreviewCarouselScene
} from '$lib/generated/project-preview-carousel';
import {
	getProjectPreviewMedia,
	type ProjectPreviewAsset
} from '$lib/generated/project-preview-media';

type AssetPath = Parameters<typeof asset>[0];

type ProjectPreviewMobilePoster = NonNullable<ProjectPreviewCarouselAsset['mobilePoster']>;

export type ResolvedProjectPreviewMediaSource = ProjectPreviewAsset['sources'][number] & {
	url: string;
};

export type ResolvedProjectPreviewMedia = {
	posterUrl: string;
	sources: ResolvedProjectPreviewMediaSource[];
	videoUrls: string[];
};

export type ResolvedProjectPreviewCarouselScene = ProjectPreviewCarouselScene & {
	sourceUrl: string | null;
};

export type ResolvedProjectPreviewMobilePoster = ProjectPreviewMobilePoster & {
	url: string;
};

export type ResolvedProjectPreviewCarousel = {
	mobilePoster: ResolvedProjectPreviewMobilePoster | null;
	scenes: ResolvedProjectPreviewCarouselScene[];
};

const sourcePriority: Record<ProjectPreviewAsset['sources'][number]['type'], number> = {
	'video/webm': 0,
	'video/mp4': 1
};

const resolveAssetUrl = (path: string) => asset(path as AssetPath);

export function resolveProjectPreviewMedia(projectId: string): ResolvedProjectPreviewMedia | null {
	const previewAsset = getProjectPreviewMedia(projectId);

	if (!previewAsset) {
		return null;
	}

	const sources = [...previewAsset.sources]
		.sort((left, right) => sourcePriority[left.type] - sourcePriority[right.type])
		.map((source) => ({
			...source,
			url: resolveAssetUrl(source.path)
		}));

	return {
		posterUrl: resolveAssetUrl(previewAsset.posterPath),
		sources,
		videoUrls: sources.map((source) => source.url)
	};
}

export function resolveProjectPreviewCarousel(
	projectId: string
): ResolvedProjectPreviewCarousel | null {
	const previewCarousel = getProjectPreviewCarousel(projectId);

	if (!previewCarousel) {
		return null;
	}

	return {
		mobilePoster: previewCarousel.mobilePoster
			? {
					...previewCarousel.mobilePoster,
					url: resolveAssetUrl(previewCarousel.mobilePoster.path)
				}
			: null,
		scenes: previewCarousel.scenes.map((scene) => ({
			...scene,
			sourceUrl: scene.source ? resolveAssetUrl(scene.source.path) : null
		}))
	};
}
