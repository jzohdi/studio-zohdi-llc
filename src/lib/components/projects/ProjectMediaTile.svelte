<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { ProjectAccent } from '$lib/data/featured-projects';
	import type { ProjectMediaItem } from '$lib/components/projects/project-media';
	import MacbookFrame from '$lib/components/projects/devices/MacbookFrame.svelte';
	import PhoneFrame from '$lib/components/projects/devices/PhoneFrame.svelte';
	import ProjectVideoEmbed from '$lib/components/projects/ProjectVideoEmbed.svelte';
	import GithubGlobe from '$lib/components/projects/GithubGlobe.svelte';
	import DdosShield from '$lib/components/projects/DdosShield.svelte';

	interface Props {
		item: ProjectMediaItem;
		accent: ProjectAccent;
		isHero?: boolean;
		revealed?: boolean;
	}

	const desktopScreenAspectRatio = 16 / 10;
	const mobileScreenAspectRatio = 9 / 19.5;

	let { item, accent, isHero = false, revealed = true }: Props = $props();

	const prefersReducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', true);

	let shouldAnimate = $derived(item.kind === 'video' && revealed && !prefersReducedMotion.current);
	let isMobileSurface = $derived(item.surface === 'mobile');
	let screenAspectRatio = $derived(
		item.source?.aspectRatio ??
			(isMobileSurface ? mobileScreenAspectRatio : desktopScreenAspectRatio)
	);

	function syncMediaPlayback(shouldPlay: boolean) {
		return (videoElement: HTMLVideoElement) => {
			if (!shouldPlay) {
				videoElement.pause();
				videoElement.currentTime = 0;
				return;
			}

			const playPromise = videoElement.play();

			if (playPromise) {
				void playPromise.catch(() => {});
			}

			return () => {
				videoElement.pause();
				videoElement.currentTime = 0;
			};
		};
	}
</script>

{#snippet mediaContent()}
	{#if item.kind === 'video' && item.sourceUrl}
		{#key `${item.id}-${shouldAnimate}`}
			<video
				class="project-media-tile__media"
				autoplay={shouldAnimate}
				loop={shouldAnimate}
				muted
				playsinline
				preload={isHero && shouldAnimate ? 'auto' : 'metadata'}
				aria-hidden="true"
				{@attach syncMediaPlayback(shouldAnimate)}
			>
				<source src={item.sourceUrl} type={item.source?.type ?? 'video/mp4'} />
			</video>
		{/key}
	{:else if item.sourceUrl}
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
	{/if}
{/snippet}

<article
	class="project-media-tile"
	data-accent={accent}
	data-span={item.span}
	data-kind={item.kind}
	data-revealed={revealed ? 'true' : 'false'}
	data-surface={item.surface}
	aria-label={(item.kind === 'image' || item.kind === 'video' || item.kind === 'logo') && item.label
		? item.label
		: undefined}
>
	<div class="project-media-tile__frame">
		{#if item.kind === 'text' && item.text}
			<div class="project-media-tile__text" data-variant={item.textVariant ?? 'display'}>
				<p>{item.text}</p>
			</div>
		{:else if item.kind === 'graphic' && item.graphic?.id === 'ddos'}
			<div class="project-media-tile__embed project-media-tile__embed--graphic">
				<DdosShield label={item.label} />
			</div>
		{:else if item.kind === 'youtube' && item.youtube}
			<div class="project-media-tile__embed">
				<ProjectVideoEmbed
					videoId={item.youtube.videoId}
					startSeconds={item.youtube.startSeconds}
					caption={item.youtube.caption}
					title={item.label}
				/>
			</div>
		{:else if item.kind === 'globe' && item.globe}
			<div class="project-media-tile__embed project-media-tile__embed--globe">
				<GithubGlobe title={item.globe.title} />
			</div>
		{:else if item.kind === 'logo' && item.sourceUrl}
			<div class="project-media-tile__logo-stage">
				<img
					class="project-media-tile__logo"
					src={item.sourceUrl}
					alt=""
					aria-hidden="true"
					decoding="async"
					draggable="false"
					loading={isHero ? 'eager' : 'lazy'}
				/>
			</div>
		{:else if item.sourceUrl}
			<div class="project-media-tile__stage" data-surface={item.surface}>
				<div class="project-media-tile__device" data-surface={item.surface}>
					{#if isMobileSurface}
						<PhoneFrame {screenAspectRatio}>
							{@render mediaContent()}
						</PhoneFrame>
					{:else}
						<MacbookFrame {screenAspectRatio}>
							{@render mediaContent()}
						</MacbookFrame>
					{/if}
				</div>
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
		opacity: 1;
		filter: none;
		transform: none;
		transform-origin: center top;
		will-change: opacity, transform, filter;
		transition:
			opacity 820ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 920ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 820ms ease;
		transition-delay: var(--project-media-reveal-delay, 0ms);
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
		isolation: isolate;
		transition: box-shadow 920ms cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: var(--project-media-reveal-delay, 0ms);
	}

	.project-media-tile__frame::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		transition: opacity 720ms ease;
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 70ms);
	}

	.project-media-tile__stage,
	.project-media-tile__logo-stage {
		position: relative;
		display: grid;
		place-items: center;
		padding: clamp(1.25rem, 3.4vw, 3rem);
		transition:
			opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 980ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 820ms ease;
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 100ms);
	}

	.project-media-tile[data-span='full'] .project-media-tile__stage {
		padding: clamp(1.6rem, 5vw, 4.5rem);
	}

	.project-media-tile__stage[data-surface='mobile'] {
		padding-block: clamp(1.5rem, 3.6vw, 2.75rem);
	}

	.project-media-tile__device {
		position: relative;
		z-index: 1;
		width: 100%;
		transition: transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 120ms);
	}

	.project-media-tile__device[data-surface='mobile'] {
		width: min(56%, 12.5rem);
	}

	.project-media-tile[data-span='full'] .project-media-tile__device[data-surface='mobile'] {
		width: min(38%, 16rem);
	}

	.project-media-tile:hover .project-media-tile__device {
		transform: translateY(-0.5rem);
	}

	.project-media-tile__logo {
		width: min(46%, 11rem);
		height: auto;
		filter: drop-shadow(0 14px 26px rgb(15 23 42 / 0.18));
		transition: transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 120ms);
	}

	.project-media-tile:hover .project-media-tile__logo {
		transform: translateY(-0.4rem) scale(1.02);
	}

	.project-media-tile[data-kind='text'] .project-media-tile__frame {
		grid-template-rows: 1fr;
	}

	.project-media-tile__text {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		height: 100%;
		min-height: clamp(13rem, 22vw, 17rem);
		padding: clamp(1rem, 2.6vw, 2rem);
		text-align: center;
		transition:
			opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 960ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 780ms ease;
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 100ms);
	}

	.project-media-tile__text p {
		margin: 0;
		max-width: 12ch;
		color: hsl(var(--foreground));
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3.35rem);
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	/* Longer sentences read better left-aligned at a more moderate size. */
	.project-media-tile__text[data-variant='statement'] {
		place-items: center start;
		text-align: left;
	}

	.project-media-tile__text[data-variant='statement'] p {
		max-width: 26ch;
		font-size: clamp(1.2rem, 1.05rem + 1.1vw, 1.85rem);
		line-height: 1.16;
		letter-spacing: -0.02em;
	}

	.project-media-tile__media {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		background: linear-gradient(180deg, rgb(227 233 242), rgb(242 245 248));
		transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 80ms);
	}

	.project-media-tile__embed {
		position: relative;
		z-index: 1;
		height: 100%;
		transition:
			opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 960ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 780ms ease;
		transition-delay: calc(var(--project-media-reveal-delay, 0ms) + 100ms);
	}

	.project-media-tile__embed--globe,
	.project-media-tile__embed--graphic {
		background: transparent;
	}

	:global(html[data-js='true']) .project-media-tile[data-revealed='false'] {
		opacity: 0;
		filter: blur(0.55rem);
		transform: translate3d(0, 2.8rem, 0) scale(0.985);
	}

	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__frame {
		box-shadow:
			0 10px 26px rgb(18 27 45 / 0.06),
			0 18px 42px var(--tile-glow);
	}

	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__frame::before {
		opacity: 0;
	}

	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__stage,
	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__logo-stage,
	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__text,
	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__embed {
		opacity: 0;
		filter: blur(0.42rem);
		transform: translate3d(0, 1.4rem, 0) scale(1.025);
	}

	:global(html[data-js='true'])
		.project-media-tile[data-revealed='false']
		.project-media-tile__media {
		transform: scale(1.06);
	}

	@media (max-width: 720px) {
		.project-media-tile__device[data-surface='mobile'],
		.project-media-tile[data-span='full'] .project-media-tile__device[data-surface='mobile'] {
			width: min(66%, 16rem);
		}

		.project-media-tile__logo {
			width: min(40%, 9rem);
		}

		.project-media-tile__text p {
			max-width: 13ch;
		}
	}

	@media (hover: none) {
		.project-media-tile:hover .project-media-tile__device {
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-media-tile,
		.project-media-tile__frame,
		.project-media-tile__frame::before,
		.project-media-tile__stage,
		.project-media-tile__logo-stage,
		.project-media-tile__logo,
		.project-media-tile__device,
		.project-media-tile__text,
		.project-media-tile__embed,
		.project-media-tile__media {
			transition: none;
		}

		:global(html[data-js='true']) .project-media-tile[data-revealed='false'] {
			opacity: 1;
			filter: none;
			transform: none;
		}

		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__frame {
			box-shadow:
				var(--shadow-card),
				0 24px 70px var(--tile-glow);
		}

		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__frame::before {
			opacity: 1;
		}

		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__stage,
		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__logo-stage,
		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__device,
		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__text,
		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__embed,
		:global(html[data-js='true'])
			.project-media-tile[data-revealed='false']
			.project-media-tile__media {
			opacity: 1;
			filter: none;
			transform: none;
		}
	}
</style>
