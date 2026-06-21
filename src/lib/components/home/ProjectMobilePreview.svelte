<script lang="ts">
	import type { FeaturedProject } from '$lib/data/featured-projects';
	import ProjectPreviewCard from '$lib/components/home/ProjectPreviewCard.svelte';
	import { resolveProjectPreviewCarousel } from '$lib/components/home/project-preview-assets';

	interface Props {
		project: FeaturedProject;
	}

	let { project }: Props = $props();

	let publishedCarousel = $derived(resolveProjectPreviewCarousel(project.id));
	let mobilePoster = $derived(publishedCarousel?.mobilePoster ?? null);
	let mobilePosterAspectRatio = $derived(mobilePoster?.aspectRatio ?? null);
</script>

{#if mobilePoster}
	<div
		class="project-mobile-preview"
		data-accent={project.accent}
		data-fit={mobilePoster.fit}
		aria-hidden="true"
	>
		<div class="project-mobile-preview__glow"></div>

		<div class="project-mobile-preview__surface">
			<span class="project-mobile-preview__tag">{project.previewLabel}</span>

			<div
				class="project-mobile-preview__device"
				style:--project-preview-device-screen-aspect-ratio={mobilePosterAspectRatio ?? undefined}
			>
				<div class="project-mobile-preview__device-notch"></div>

				<div class="project-mobile-preview__device-screen">
					<img
						class="project-mobile-preview__media"
						src={mobilePoster.url}
						alt=""
						decoding="async"
						draggable="false"
						loading="lazy"
					/>
				</div>
			</div>
		</div>
	</div>
{:else}
	<ProjectPreviewCard {project} size="mobile" />
{/if}

<style>
	.project-mobile-preview {
		--preview-shell-start: rgb(255 255 255 / 0.95);
		--preview-shell-end: rgb(239 241 248 / 0.82);
		--preview-scene-start: rgb(248 250 253 / 0.98);
		--preview-scene-end: rgb(224 230 241 / 0.94);
		--preview-glow: rgb(255 122 200 / 0.18);

		position: relative;
		width: 100%;
		min-width: clamp(8.5rem, 31vw, 10.75rem);
		aspect-ratio: 1.08 / 0.84;
		border-radius: clamp(1.45rem, 3vw, 2.35rem);
		overflow: hidden;
		isolation: isolate;
		box-shadow: var(--shadow-card);
	}

	.project-mobile-preview[data-accent='warm'] {
		--preview-shell-start: rgb(255 247 240 / 0.96);
		--preview-shell-end: rgb(248 226 208 / 0.84);
		--preview-scene-start: rgb(255 246 238 / 0.98);
		--preview-scene-end: rgb(241 221 203 / 0.92);
		--preview-glow: rgb(198 124 77 / 0.2);
	}

	.project-mobile-preview[data-accent='green'] {
		--preview-shell-start: rgb(245 251 248 / 0.96);
		--preview-shell-end: rgb(219 240 231 / 0.84);
		--preview-scene-start: rgb(244 251 247 / 0.98);
		--preview-scene-end: rgb(210 236 224 / 0.92);
		--preview-glow: rgb(17 140 122 / 0.22);
	}

	.project-mobile-preview[data-accent='cool'] {
		--preview-shell-start: rgb(242 245 255 / 0.96);
		--preview-shell-end: rgb(221 228 251 / 0.84);
		--preview-scene-start: rgb(244 246 255 / 0.98);
		--preview-scene-end: rgb(215 223 252 / 0.92);
		--preview-glow: rgb(96 118 255 / 0.2);
	}

	.project-mobile-preview[data-accent='sky'] {
		--preview-shell-start: rgb(242 252 252 / 0.96);
		--preview-shell-end: rgb(221 241 246 / 0.84);
		--preview-scene-start: rgb(243 252 253 / 0.98);
		--preview-scene-end: rgb(213 238 245 / 0.92);
		--preview-glow: rgb(52 167 218 / 0.2);
	}

	.project-mobile-preview[data-accent='violet'] {
		--preview-shell-start: rgb(246 242 255 / 0.95);
		--preview-shell-end: rgb(232 221 255 / 0.84);
		--preview-scene-start: rgb(245 240 255 / 0.98);
		--preview-scene-end: rgb(227 214 255 / 0.92);
		--preview-glow: rgb(125 79 255 / 0.22);
	}

	.project-mobile-preview__glow {
		position: absolute;
		inset: -28%;
		background: radial-gradient(circle at top right, var(--preview-glow), transparent 44%);
		pointer-events: none;
	}

	.project-mobile-preview__surface {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		padding: 0.9rem;
		border: 1px solid hsl(0 0% 100% / 0.35);
		border-radius: inherit;
		background:
			linear-gradient(155deg, var(--preview-shell-start), var(--preview-shell-end)),
			radial-gradient(circle at top, rgb(255 255 255 / 0.3), transparent 48%);
	}

	.project-mobile-preview__surface::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, hsl(0 0% 100% / 0.08), transparent 40%);
		pointer-events: none;
	}

	.project-mobile-preview__tag {
		position: absolute;
		top: 0.7rem;
		left: 0.7rem;
		z-index: 1;
		padding: 0.34rem 0.62rem;
		border-radius: 999px;
		background: hsl(0 0% 100% / 0.58);
		backdrop-filter: blur(18px);
		color: hsl(222 20% 18% / 0.8);
		font-family: var(--font-display);
		font-size: 0.55rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.project-mobile-preview__device {
		position: relative;
		width: min(46%, 5.3rem);
		padding: 0.26rem;
		border-radius: 1.2rem;
		background: linear-gradient(180deg, rgb(26 35 52 / 0.97), rgb(10 14 25 / 0.94));
		box-shadow:
			0 22px 40px rgb(15 23 42 / 0.18),
			inset 0 1px 0 rgb(255 255 255 / 0.08);
	}

	.project-mobile-preview__device-notch {
		position: absolute;
		top: 0.36rem;
		left: 50%;
		width: 38%;
		height: 0.22rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.14);
		transform: translateX(-50%);
		z-index: 1;
	}

	.project-mobile-preview__device-screen {
		width: 100%;
		aspect-ratio: var(--project-preview-device-screen-aspect-ratio, 0.5);
		border-radius: 0.96rem;
		overflow: hidden;
		background:
			linear-gradient(180deg, var(--preview-scene-start), var(--preview-scene-end)),
			radial-gradient(circle at top, rgb(255 255 255 / 0.26), transparent 42%);
	}

	.project-mobile-preview__media {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: linear-gradient(180deg, rgb(227 233 242), rgb(242 245 248));
	}

	.project-mobile-preview[data-fit='contain'] .project-mobile-preview__media {
		object-fit: contain;
		object-position: top center;
	}
</style>
