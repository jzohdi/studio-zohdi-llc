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
type ProjectPreviewPreloadAssetKind = 'image' | 'video';
type ProjectPreviewPreloadCandidate = {
	url: string;
	kind: ProjectPreviewPreloadAssetKind;
};

export type ProjectPreviewPreloadStrategy = 'first' | 'all';
export type ProjectPreviewPreloadPriority = 'low' | 'high';

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
const idlePreloadFlushTimeoutInMs = 120;
const preloadRequestTimeoutInMs = 20_000;

const resolveAssetUrl = (path: string) => asset(path as AssetPath);
const idlePreloadQueue = new Map<string, ProjectPreviewPreloadCandidate>();
const inFlightPreloads = new Map<string, Promise<void>>();
const completedPreloadUrls = new Set<string>();

let idlePreloadCallbackId: number | null = null;
let idlePreloadTimeoutId: number | null = null;

function dedupePreloadCandidates(
	candidates: ProjectPreviewPreloadCandidate[]
): ProjectPreviewPreloadCandidate[] {
	const seenUrls = new Set<string>();

	return candidates.filter((candidate) => {
		if (seenUrls.has(candidate.url)) {
			return false;
		}

		seenUrls.add(candidate.url);
		return true;
	});
}

function createCarouselPreloadCandidates(projectId: string): ProjectPreviewPreloadCandidate[] {
	const previewCarousel = resolveProjectPreviewCarousel(projectId);

	if (!previewCarousel) {
		return [];
	}

	const sceneCandidates = previewCarousel.scenes.flatMap(
		(scene): ProjectPreviewPreloadCandidate[] => {
			if (!scene.sourceUrl) {
				return [];
			}

			return [
				{
					url: scene.sourceUrl,
					kind: scene.kind === 'video' ? 'video' : 'image'
				}
			];
		}
	);

	if (
		previewCarousel.mobilePoster &&
		!sceneCandidates.some((candidate) => candidate.url === previewCarousel.mobilePoster?.url)
	) {
		sceneCandidates.push({
			url: previewCarousel.mobilePoster.url,
			kind: 'image'
		});
	}

	return dedupePreloadCandidates(sceneCandidates);
}

function createPreviewMediaPreloadCandidates(projectId: string): ProjectPreviewPreloadCandidate[] {
	const previewMedia = resolveProjectPreviewMedia(projectId);

	if (!previewMedia) {
		return [];
	}

	return dedupePreloadCandidates([
		{
			url: previewMedia.posterUrl,
			kind: 'image'
		},
		...previewMedia.sources.map((source) => ({
			url: source.url,
			kind: 'video' as const
		}))
	]);
}

function getProjectPreviewPreloadCandidates(
	projectId: string,
	strategy: ProjectPreviewPreloadStrategy
): ProjectPreviewPreloadCandidate[] {
	const carouselCandidates = createCarouselPreloadCandidates(projectId);
	const candidates =
		carouselCandidates.length > 0
			? carouselCandidates
			: createPreviewMediaPreloadCandidates(projectId);

	if (strategy === 'first') {
		return candidates.slice(0, 1);
	}

	return candidates;
}

function clearIdlePreloadFlush() {
	if (typeof window === 'undefined') {
		return;
	}

	if (idlePreloadCallbackId !== null && typeof window.cancelIdleCallback === 'function') {
		window.cancelIdleCallback(idlePreloadCallbackId);
		idlePreloadCallbackId = null;
	}

	if (idlePreloadTimeoutId !== null) {
		window.clearTimeout(idlePreloadTimeoutId);
		idlePreloadTimeoutId = null;
	}
}

function startPreload(
	candidate: ProjectPreviewPreloadCandidate,
	priority: ProjectPreviewPreloadPriority
) {
	const existingPreload = inFlightPreloads.get(candidate.url);

	if (existingPreload) {
		return existingPreload;
	}

	const preload = preloadCandidate(candidate, priority).finally(() => {
		inFlightPreloads.delete(candidate.url);
		completedPreloadUrls.add(candidate.url);
	});

	inFlightPreloads.set(candidate.url, preload);

	return preload;
}

function scheduleIdlePreloadFlush() {
	if (typeof window === 'undefined' || idlePreloadQueue.size === 0) {
		return;
	}

	if (idlePreloadCallbackId !== null || idlePreloadTimeoutId !== null) {
		return;
	}

	const flushIdlePreloadQueue = () => {
		idlePreloadCallbackId = null;
		idlePreloadTimeoutId = null;
		const queuedCandidates = [...idlePreloadQueue.values()];

		idlePreloadQueue.clear();

		for (const candidate of queuedCandidates) {
			void startPreload(candidate, 'low');
		}
	};

	if (typeof window.requestIdleCallback === 'function') {
		idlePreloadCallbackId = window.requestIdleCallback(flushIdlePreloadQueue, {
			timeout: 1_500
		});
		return;
	}

	idlePreloadTimeoutId = window.setTimeout(flushIdlePreloadQueue, idlePreloadFlushTimeoutInMs);
}

function queueLowPriorityPreload(candidate: ProjectPreviewPreloadCandidate) {
	if (completedPreloadUrls.has(candidate.url) || inFlightPreloads.has(candidate.url)) {
		return;
	}

	idlePreloadQueue.set(candidate.url, candidate);
	scheduleIdlePreloadFlush();
}

function queueHighPriorityPreload(candidate: ProjectPreviewPreloadCandidate) {
	if (completedPreloadUrls.has(candidate.url)) {
		return;
	}

	if (idlePreloadQueue.delete(candidate.url) && idlePreloadQueue.size === 0) {
		clearIdlePreloadFlush();
	}

	void startPreload(candidate, 'high');
}

function preloadImageAsset(url: string, priority: ProjectPreviewPreloadPriority): Promise<void> {
	return new Promise((resolve) => {
		const image = new Image();
		let timeoutId: number | null = null;

		const cleanup = () => {
			image.onload = null;
			image.onerror = null;

			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}

			resolve();
		};

		image.decoding = 'async';
		image.setAttribute('fetchpriority', priority);
		image.onload = cleanup;
		image.onerror = cleanup;
		timeoutId = window.setTimeout(cleanup, preloadRequestTimeoutInMs);
		image.src = url;
	});
}

function preloadVideoAsset(url: string): Promise<void> {
	return new Promise((resolve) => {
		const video = document.createElement('video');
		let timeoutId: number | null = null;

		const cleanup = () => {
			video.onloadeddata = null;
			video.onerror = null;
			video.removeAttribute('src');
			video.load();

			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}

			resolve();
		};

		video.muted = true;
		video.preload = 'auto';
		video.playsInline = true;
		video.onloadeddata = cleanup;
		video.onerror = cleanup;
		timeoutId = window.setTimeout(cleanup, preloadRequestTimeoutInMs);
		video.src = url;
		video.load();
	});
}

function preloadWithLink(
	candidate: ProjectPreviewPreloadCandidate,
	priority: ProjectPreviewPreloadPriority
): Promise<void> {
	return new Promise((resolve) => {
		const preloadLink = document.createElement('link');
		let timeoutId: number | null = null;

		const cleanup = () => {
			preloadLink.onload = null;
			preloadLink.onerror = null;
			preloadLink.remove();

			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}

			resolve();
		};

		preloadLink.rel = 'preload';
		preloadLink.as = candidate.kind;
		preloadLink.href = candidate.url;
		preloadLink.setAttribute('fetchpriority', priority);
		preloadLink.onload = cleanup;
		preloadLink.onerror = cleanup;
		timeoutId = window.setTimeout(cleanup, preloadRequestTimeoutInMs);
		document.head.append(preloadLink);
	});
}

function preloadCandidate(
	candidate: ProjectPreviewPreloadCandidate,
	priority: ProjectPreviewPreloadPriority
): Promise<void> {
	if (typeof document === 'undefined') {
		return Promise.resolve();
	}

	const preloadLink = document.createElement('link');

	if (
		typeof preloadLink.relList?.supports === 'function' &&
		preloadLink.relList.supports('preload')
	) {
		return preloadWithLink(candidate, priority);
	}

	if (candidate.kind === 'video') {
		return preloadVideoAsset(candidate.url);
	}

	return preloadImageAsset(candidate.url, priority);
}

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

export function preloadProjectPreviewAssets(
	projectId: string,
	strategy: ProjectPreviewPreloadStrategy,
	priority: ProjectPreviewPreloadPriority
) {
	if (typeof window === 'undefined') {
		return;
	}

	for (const candidate of getProjectPreviewPreloadCandidates(projectId, strategy)) {
		if (priority === 'high') {
			queueHighPriorityPreload(candidate);
			continue;
		}

		queueLowPriorityPreload(candidate);
	}
}
