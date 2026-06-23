<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { ProjectAccent } from '$lib/data/featured-projects';
	import type { ProjectMediaItem } from '$lib/components/projects/project-media';

	interface Props {
		item: ProjectMediaItem;
		accent: ProjectAccent;
		isHero?: boolean;
	}

	let { item, accent, isHero = false }: Props = $props();

	const prefersReducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', true);

	let itemTitleId = $derived(`project-media-${item.id}`);
	let shouldAnimate = $derived(item.kind === 'video' && !prefersReducedMotion.current);
	let mediaEyebrow = $derived(
		item.kind === 'text' ? 'Callout' : item.surface === 'mobile' ? 'Mobile view' : 'Product view'
	);
</script>

<article
	class="project-media-tile"
	data-accent={accent}
	data-hero={isHero ? 'true' : 'false'}
	data-kind={item.kind}
	data-surface={item.surface}
	aria-labelledby={itemTitleId}
>
	<div class="project-media-tile__frame">
		<div class="project-media-tile__meta">
			<p class="project-media-tile__eyebrow eyebrow">{mediaEyebrow}</p>
			<h3 class="project-media-tile__title" id={itemTitleId}>{item.label}</h3>
		</div>

		{#if item.kind === 'text' && item.text}
			<div class="project-media-tile__text">
				<p>{item.text}</p>
			</div>
		{:else if item.kind === 'video' && item.sourceUrl}
			<div class="project-media-tile__visual" data-fit={item.fit}>
				{#key `${item.id}-${shouldAnimate}`}
					<video
						class="project-media-tile__media"
						autoplay={shouldAnimate}
						loop={shouldAnimate}
						muted
						playsinline
						preload={isHero && shouldAnimate ? 'auto' : 'metadata'}
						aria-hidden="true"
					>
						<source src={item.sourceUrl} type={item.source?.type ?? 'video/mp4'} />
					</video>
				{/key}
			</div>
		{:else if item.sourceUrl}
			<div class="project-media-tile__visual" data-fit={item.fit}>
				<img
					class="project-media-tile__media"
					src={item.sourceUrl}
					alt=""
					aria-hidden="true"
					decoding="async"
					draggable="false"
					loading={isHero ? 'eager' : 'lazy'}
					width={item.source?.width ?? undefined}
					height={item.source?.height ?? undefined}
				/>
			</div>
		{/if}
	</div>
</article>

<style>
	.project-media-tile {
		--tile-shell-start: rgb(255 255 255 / 0.82);
		--tile-shell-end: rgb(241 244 248 / 0.72);
		--tile-surface-start: rgb(248 250 253 / 0.96);
		--tile-surface-end: rgb(227 233 242 / 0.88);
		--tile-border: rgb(18 27 45 / 0.08);
		--tile-glow: rgb(255 122 200 / 0.18);
		--tile-strong: rgb(18 27 45 / 0.92);
		--tile-muted: rgb(55 70 98 / 0.62);

		height: 100%;
	}

	.project-media-tile[data-accent='warm'] {
		--tile-shell-start: rgb(255 247 240 / 0.9);
		--tile-shell-end: rgb(248 226 208 / 0.72);
		--tile-surface-start: rgb(255 246 239 / 0.96);
		--tile-surface-end: rgb(245 226 210 / 0.9);
		--tile-glow: rgb(198 124 77 / 0.2);
	}

	.project-media-tile[data-accent='green'] {
		--tile-shell-start: rgb(245 251 248 / 0.9);
		--tile-shell-end: rgb(219 240 231 / 0.72);
		--tile-surface-start: rgb(244 251 247 / 0.96);
		--tile-surface-end: rgb(216 239 228 / 0.9);
		--tile-glow: rgb(17 140 122 / 0.2);
	}

	.project-media-tile[data-accent='cool'] {
		--tile-shell-start: rgb(243 246 255 / 0.9);
		--tile-shell-end: rgb(223 229 252 / 0.74);
		--tile-surface-start: rgb(244 246 255 / 0.96);
		--tile-surface-end: rgb(217 224 253 / 0.9);
		--tile-glow: rgb(96 118 255 / 0.18);
	}

	.project-media-tile[data-accent='sky'] {
		--tile-shell-start: rgb(242 252 252 / 0.9);
		--tile-shell-end: rgb(221 241 246 / 0.72);
		--tile-surface-start: rgb(243 252 253 / 0.96);
		--tile-surface-end: rgb(214 239 245 / 0.9);
		--tile-glow: rgb(52 167 218 / 0.18);
	}

	.project-media-tile[data-accent='violet'] {
		--tile-shell-start: rgb(246 242 255 / 0.9);
		--tile-shell-end: rgb(232 221 255 / 0.74);
		--tile-surface-start: rgb(245 240 255 / 0.96);
		--tile-surface-end: rgb(229 218 255 / 0.9);
		--tile-glow: rgb(125 79 255 / 0.2);
	}

	.project-media-tile__frame {
		position: relative;
		display: grid;
		gap: 1rem;
		height: 100%;
		padding: clamp(1rem, 2vw, 1.35rem);
		border: 1px solid var(--tile-border);
		border-radius: clamp(1.35rem, 2.5vw, 1.8rem);
		background:
			linear-gradient(155deg, var(--tile-shell-start), var(--tile-shell-end)),
			radial-gradient(circle at top, rgb(255 255 255 / 0.24), transparent 52%);
		box-shadow:
			var(--shadow-card),
			0 24px 70px var(--tile-glow);
		overflow: hidden;
		isolation: isolate;
	}

	.project-media-tile__frame::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgb(255 255 255 / 0.16), transparent 30%);
		pointer-events: none;
	}

	.project-media-tile__meta {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 0.35rem;
	}

	.project-media-tile__eyebrow {
		color: var(--tile-muted);
	}

	.project-media-tile__title {
		color: var(--tile-strong);
		font-size: clamp(0.98rem, 1.4vw, 1.18rem);
		font-weight: 600;
		letter-spacing: -0.03em;
	}

	.project-media-tile__visual {
		position: relative;
		border-radius: clamp(1rem, 1.8vw, 1.35rem);
		overflow: hidden;
		background:
			linear-gradient(160deg, var(--tile-surface-start), var(--tile-surface-end)),
			radial-gradient(circle at top, rgb(255 255 255 / 0.26), transparent 50%);
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.26),
			inset 0 1px 0 rgb(255 255 255 / 0.36);
	}

	.project-media-tile[data-hero='true'] .project-media-tile__visual {
		min-height: clamp(22rem, 54vw, 42rem);
	}

	.project-media-tile[data-surface='desktop'][data-hero='false'] .project-media-tile__visual {
		min-height: clamp(14rem, 28vw, 20rem);
	}

	.project-media-tile[data-surface='mobile'][data-hero='false'] .project-media-tile__visual {
		aspect-ratio: 0.66;
	}

	.project-media-tile[data-kind='text'] .project-media-tile__frame {
		align-content: space-between;
	}

	.project-media-tile__text {
		position: relative;
		z-index: 1;
		display: grid;
		align-content: end;
		min-height: clamp(13rem, 22vw, 17rem);
	}

	.project-media-tile__text p {
		max-width: 12ch;
		color: var(--tile-strong);
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3.35rem);
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	.project-media-tile__media {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: linear-gradient(180deg, rgb(227 233 242), rgb(242 245 248));
	}

	.project-media-tile__visual[data-fit='contain'] .project-media-tile__media {
		object-fit: contain;
	}

	.project-media-tile[data-surface='mobile']
		.project-media-tile__visual[data-fit='contain']
		.project-media-tile__media {
		object-position: top center;
	}

	@media (max-width: 720px) {
		.project-media-tile[data-hero='true'] .project-media-tile__visual {
			min-height: clamp(17rem, 72vw, 25rem);
		}

		.project-media-tile[data-surface='desktop'][data-hero='false'] .project-media-tile__visual {
			min-height: clamp(12.5rem, 56vw, 18rem);
		}

		.project-media-tile__text p {
			max-width: 13ch;
		}
	}
</style>
