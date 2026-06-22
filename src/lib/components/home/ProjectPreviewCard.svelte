<script lang="ts">
	import type { FeaturedProject } from '$lib/data/featured-projects';
	import MalibouScene from '$lib/components/home/preview-scenes/MalibouScene.svelte';
	import ZefirScene from '$lib/components/home/preview-scenes/ZefirScene.svelte';
	import HeySimonScene from '$lib/components/home/preview-scenes/HeySimonScene.svelte';
	import OsolScene from '$lib/components/home/preview-scenes/OsolScene.svelte';
	import SuperComicsScene from '$lib/components/home/preview-scenes/SuperComicsScene.svelte';

	type PreviewSize = 'desktop' | 'mobile';

	interface Props {
		project: FeaturedProject;
		size?: PreviewSize;
		isActive?: boolean;
	}

	let { project, size = 'desktop', isActive = false }: Props = $props();
</script>

<div
	class={`preview-card preview-card--${size}`}
	data-variant={project.previewVariant}
	data-active={isActive}
	aria-hidden="true"
>
	<div class="preview-card__glow"></div>
	<div class="preview-card__surface">
		<span class="preview-card__tag">{project.previewLabel}</span>

		{#if project.previewVariant === 'malibou'}
			<MalibouScene />
		{:else if project.previewVariant === 'zefir'}
			<ZefirScene />
		{:else if project.previewVariant === 'heysimon'}
			<HeySimonScene />
		{:else if project.previewVariant === 'osol'}
			<OsolScene />
		{:else}
			<SuperComicsScene />
		{/if}
	</div>
</div>

<style>
	.preview-card {
		position: relative;
		width: 100%;
		aspect-ratio: 1.48 / 1;
		border-radius: clamp(1.45rem, 3vw, 2.35rem);
		overflow: hidden;
		isolation: isolate;
		box-shadow: var(--shadow-card);
	}

	.preview-card--mobile {
		aspect-ratio: 1.08 / 0.84;
		min-width: clamp(8.5rem, 31vw, 10.75rem);
	}

	.preview-card--desktop .preview-card__surface {
		padding: clamp(0.82rem, 1.45vw, 1.15rem);
	}

	.preview-card[data-active='true'] {
		filter: saturate(1.02);
	}

	.preview-card__glow {
		position: absolute;
		inset: -28%;
		background: radial-gradient(circle at top right, hsl(var(--pink) / 0.2), transparent 46%);
		pointer-events: none;
	}

	.preview-card__surface {
		position: relative;
		width: 100%;
		height: 100%;
		padding: clamp(0.9rem, 2vw, 1.35rem);
		border: 1px solid hsl(0 0% 100% / 0.35);
		border-radius: inherit;
	}

	.preview-card__surface::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, hsl(0 0% 100% / 0.08), transparent 40%);
		pointer-events: none;
	}

	.preview-card__tag {
		position: absolute;
		top: clamp(0.7rem, 1.8vw, 1rem);
		left: clamp(0.7rem, 1.8vw, 1rem);
		z-index: 2;
		padding: 0.38rem 0.7rem;
		border-radius: 999px;
		background: hsl(0 0% 100% / 0.56);
		backdrop-filter: blur(18px);
		color: hsl(222 20% 18% / 0.8);
		font-family: var(--font-display);
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.preview-card--mobile .preview-card__tag {
		font-size: 0.55rem;
		letter-spacing: 0.12em;
	}

	.preview-card--desktop .preview-card__tag {
		top: clamp(0.65rem, 1.25vw, 0.9rem);
		left: clamp(0.65rem, 1.25vw, 0.9rem);
	}

	.preview-card[data-variant='malibou'] .preview-card__surface {
		background: linear-gradient(150deg, #fff4ea 0%, #f8dcc6 54%, #efc2a3 100%);
	}

	.preview-card[data-variant='zefir'] .preview-card__surface {
		background: linear-gradient(160deg, #eff8f1 0%, #d8ecd9 58%, #cfe2d6 100%);
	}

	.preview-card[data-variant='heysimon'] .preview-card__surface {
		background: linear-gradient(160deg, #eef1ff 0%, #d4d8ff 48%, #dbe0f2 100%);
	}

	.preview-card[data-variant='osol'] .preview-card__surface {
		background: linear-gradient(160deg, #eefcf8 0%, #dff7ef 45%, #d6eef8 100%);
	}

	.preview-card[data-variant='supercomics'] .preview-card__surface {
		background: linear-gradient(145deg, #4f31ff 0%, #8d48ff 42%, #ff5fad 100%);
	}

	.preview-card[data-variant='supercomics'] .preview-card__tag {
		background: rgb(11 9 40 / 22%);
		color: rgb(255 255 255 / 92%);
	}
</style>
