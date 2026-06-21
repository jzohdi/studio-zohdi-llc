<script lang="ts">
	import { asset } from '$app/paths';
	import type { FeaturedProject } from '$lib/data/featured-projects';
	import {
		getProjectPreviewMedia,
		type ProjectPreviewAsset
	} from '$lib/generated/project-preview-media';
	import ProjectPreviewCard from '$lib/components/home/ProjectPreviewCard.svelte';

	interface Props {
		project: FeaturedProject;
		isActive: boolean;
	}

	type ResolvedProjectPreviewMediaSource = ProjectPreviewAsset['sources'][number] & {
		url: string;
	};

	type ResolvedProjectPreviewMedia = {
		posterUrl: string;
		sources: ResolvedProjectPreviewMediaSource[];
		videoUrls: string[];
	};

	type AssetPath = Parameters<typeof asset>[0];

	const sourcePriority: Record<ProjectPreviewAsset['sources'][number]['type'], number> = {
		'video/webm': 0,
		'video/mp4': 1
	};

	let { project, isActive }: Props = $props();

	const resolveAssetUrl = (path: string) => asset(path as AssetPath);

	function resolveProjectPreviewMedia(
		previewAsset: ProjectPreviewAsset | null
	): ResolvedProjectPreviewMedia | null {
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

	let previewAsset = $derived(getProjectPreviewMedia(project.id));
	let publishedPreview = $derived(resolveProjectPreviewMedia(previewAsset));
	let videoUrlsAttribute = $derived(
		publishedPreview ? publishedPreview.videoUrls.join(',') : undefined
	);
</script>

{#if publishedPreview}
	<div
		class="project-desktop-preview"
		data-accent={project.accent}
		data-active={isActive}
		data-poster-url={publishedPreview.posterUrl}
		data-video-urls={videoUrlsAttribute}
		data-autoplay="true"
		data-loop="true"
		aria-hidden="true"
	>
		<div class="project-desktop-preview__glow"></div>

		<div class="project-desktop-preview__frame">
			<div class="project-desktop-preview__media-shell">
				{#if isActive}
					<video
						class="project-desktop-preview__media"
						autoplay
						muted
						loop
						playsinline
						preload="metadata"
						poster={publishedPreview.posterUrl}
					>
						{#each publishedPreview.sources as source (source.type)}
							<source src={source.url} type={source.type} />
						{/each}
					</video>
				{:else}
					<img
						class="project-desktop-preview__media"
						src={publishedPreview.posterUrl}
						alt=""
						decoding="async"
						draggable="false"
						loading="lazy"
					/>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<ProjectPreviewCard {project} size="desktop" {isActive} />
{/if}

<style>
	.project-desktop-preview {
		--preview-shell-start: rgb(255 255 255 / 0.92);
		--preview-shell-end: rgb(239 241 248 / 0.78);
		--preview-shell-border: rgb(255 255 255 / 0.36);
		--preview-media-border: rgb(255 255 255 / 0.18);
		--preview-glow: rgb(255 122 200 / 0.16);
		--preview-shadow: 0 30px 90px rgb(15 23 42 / 0.18);
		--preview-highlight: rgb(255 255 255 / 0.72);
		--preview-meta: rgb(53 65 88 / 0.58);

		position: relative;
		width: 100%;
		aspect-ratio: 3 / 2;
		border-radius: clamp(1.45rem, 3vw, 2.35rem);
		overflow: hidden;
		isolation: isolate;
		box-shadow: var(--shadow-card);
	}

	.project-desktop-preview[data-accent='warm'] {
		--preview-shell-start: rgb(255 247 240 / 0.95);
		--preview-shell-end: rgb(248 226 208 / 0.8);
		--preview-glow: rgb(198 124 77 / 0.18);
	}

	.project-desktop-preview[data-accent='green'] {
		--preview-shell-start: rgb(245 251 248 / 0.95);
		--preview-shell-end: rgb(219 240 231 / 0.82);
		--preview-glow: rgb(17 140 122 / 0.2);
	}

	.project-desktop-preview[data-accent='cool'] {
		--preview-shell-start: rgb(242 245 255 / 0.95);
		--preview-shell-end: rgb(221 228 251 / 0.82);
		--preview-glow: rgb(96 118 255 / 0.18);
	}

	.project-desktop-preview[data-accent='sky'] {
		--preview-shell-start: rgb(242 252 252 / 0.95);
		--preview-shell-end: rgb(221 241 246 / 0.82);
		--preview-glow: rgb(52 167 218 / 0.18);
	}

	.project-desktop-preview[data-accent='violet'] {
		--preview-shell-start: rgb(246 242 255 / 0.94);
		--preview-shell-end: rgb(232 221 255 / 0.82);
		--preview-glow: rgb(125 79 255 / 0.2);
	}

	.project-desktop-preview[data-active='true'] {
		box-shadow:
			var(--shadow-card),
			0 30px 90px var(--preview-glow);
	}

	.project-desktop-preview__glow {
		position: absolute;
		inset: -30%;
		background:
			radial-gradient(circle at top right, var(--preview-glow), transparent 34%),
			radial-gradient(circle at bottom left, rgb(15 23 42 / 0.08), transparent 44%);
		pointer-events: none;
	}

	.project-desktop-preview__frame {
		position: relative;
		width: 100%;
		height: 100%;
		border: 1px solid var(--preview-shell-border);
		border-radius: inherit;
		box-shadow: var(--preview-shadow);
		backdrop-filter: blur(20px);
	}

	.project-desktop-preview__frame::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		mix-blend-mode: screen;
		opacity: 0.52;
		pointer-events: none;
	}

	.project-desktop-preview__media-shell {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: clamp(1rem, 2vw, 1.65rem);
		overflow: hidden;
		box-shadow:
			inset 0 0 0 1px var(--preview-media-border),
			inset 0 1px 0 rgb(255 255 255 / 0.4);
	}

	.project-desktop-preview__media-shell::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
	}

	.project-desktop-preview__media {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: rgb(233 238 244);
	}

	@media (prefers-reduced-motion: reduce) {
		.project-desktop-preview {
			transition: none;
		}
	}
</style>
