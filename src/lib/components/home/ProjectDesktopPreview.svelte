<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { FeaturedProject } from '$lib/data/featured-projects';
	import ProjectPreviewCard from '$lib/components/home/ProjectPreviewCard.svelte';
	import {
		resolveProjectPreviewCarousel,
		resolveProjectPreviewMedia
	} from '$lib/components/home/project-preview-assets';

	interface Props {
		project: FeaturedProject;
		isActive: boolean;
	}

	let { project, isActive }: Props = $props();

	const prefersReducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', true);

	let activeSceneIndex = $state(0);
	let publishedCarousel = $derived(resolveProjectPreviewCarousel(project.id));
	let publishedPreview = $derived(resolveProjectPreviewMedia(project.id));
	let sceneCount = $derived(publishedCarousel?.scenes.length ?? 0);
	let hasCarousel = $derived(Boolean(publishedCarousel && sceneCount > 0));
	let normalizedSceneIndex = $derived(
		sceneCount > 0 && isActive ? activeSceneIndex % sceneCount : 0
	);
	let currentScene = $derived(
		hasCarousel && publishedCarousel
			? (publishedCarousel.scenes[normalizedSceneIndex] ?? publishedCarousel.scenes[0] ?? null)
			: null
	);
	let currentMobileSceneAspectRatio = $derived(
		currentScene?.surface === 'mobile' ? (currentScene.source?.aspectRatio ?? null) : null
	);
	let shouldAnimateMedia = $derived(Boolean(isActive && !prefersReducedMotion.current));
	let shouldAutoAdvance = $derived(
		Boolean(shouldAnimateMedia && publishedCarousel && publishedCarousel.scenes.length > 1)
	);

	function queueSceneAdvance(durationInMs: number) {
		return window.setTimeout(
			() => {
				activeSceneIndex += 1;
			},
			Math.max(durationInMs, 1200)
		);
	}

	function syncPreviewVideo(shouldPlay: boolean) {
		return (videoElement: HTMLVideoElement) => {
			$effect(() => {
				if (!shouldPlay) {
					videoElement.pause();
					videoElement.currentTime = 0;
					return;
				}

				videoElement.currentTime = 0;

				const playPromise = videoElement.play();

				if (playPromise) {
					void playPromise.catch(() => {});
				}

				return () => {
					videoElement.pause();
					videoElement.currentTime = 0;
				};
			});
		};
	}

	$effect(() => {
		if (!shouldAutoAdvance || !currentScene) {
			return;
		}

		const timeout = queueSceneAdvance(currentScene.durationInMs);

		return () => {
			window.clearTimeout(timeout);
		};
	});
</script>

{#snippet carouselSceneMedia()}
	{#if currentScene}
		{#if currentScene.kind === 'video' && currentScene.sourceUrl}
			<video
				class="preview-carousel__media"
				autoplay={shouldAnimateMedia}
				muted
				playsinline
				preload={shouldAnimateMedia ? 'auto' : 'metadata'}
				{@attach syncPreviewVideo(shouldAnimateMedia)}
			>
				<source src={currentScene.sourceUrl} type={currentScene.source?.type ?? 'video/mp4'} />
			</video>
		{:else if currentScene.sourceUrl}
			<img
				class="preview-carousel__media"
				src={currentScene.sourceUrl}
				alt=""
				decoding="async"
				draggable="false"
				loading="lazy"
			/>
		{/if}
	{/if}
{/snippet}

{#if hasCarousel && currentScene}
	<div
		class="project-desktop-preview"
		data-accent={project.accent}
		data-active={isActive}
		data-scene-kind={currentScene.kind}
		data-scene-surface={currentScene.surface}
		aria-hidden="true"
	>
		<div class="project-desktop-preview__glow"></div>

		<div class="project-desktop-preview__frame">
			<div class="project-desktop-preview__media-shell">
				<div class="preview-carousel">
					<div class="preview-carousel__meta">
						<span class="preview-carousel__pill">{project.previewLabel}</span>
					</div>

					<div class="preview-carousel__viewport">
						{#key currentScene.id}
							<div
								class="preview-carousel__slide"
								data-fit={currentScene.fit}
								data-kind={currentScene.kind}
								data-surface={currentScene.surface}
							>
								{#if currentScene.kind === 'text'}
									<div class="preview-carousel__text-slide">
										{#if currentScene.text}
											<p>{currentScene.text}</p>
										{/if}
									</div>
								{:else if currentScene.surface === 'mobile'}
									<div
										class="preview-carousel__device"
										style:--project-preview-device-screen-aspect-ratio={currentMobileSceneAspectRatio ??
											undefined}
									>
										<div class="preview-carousel__device-notch"></div>

										<div class="preview-carousel__device-screen">
											{@render carouselSceneMedia()}
										</div>
									</div>
								{:else}
									{@render carouselSceneMedia()}
								{/if}
							</div>
						{/key}
					</div>

					{#if publishedCarousel && publishedCarousel.scenes.length > 1}
						<div class="preview-carousel__footer">
							<div class="preview-carousel__progress" aria-hidden="true">
								{#each publishedCarousel.scenes as scene, index (scene.id)}
									<span
										class={`preview-carousel__dot ${index === normalizedSceneIndex ? 'is-active' : ''}`}
									></span>
								{/each}
							</div>

							<span class="preview-carousel__count">
								{(normalizedSceneIndex + 1).toString().padStart(2, '0')} /
								{publishedCarousel.scenes.length.toString().padStart(2, '0')}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else if publishedPreview}
	<div
		class="project-desktop-preview"
		data-accent={project.accent}
		data-active={isActive}
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
		--preview-scene-start: rgb(250 251 254 / 0.96);
		--preview-scene-end: rgb(223 229 241 / 0.86);
		--preview-shell-border: rgb(255 255 255 / 0.36);
		--preview-media-border: rgb(255 255 255 / 0.18);
		--preview-glow: rgb(255 122 200 / 0.16);
		--preview-shadow: 0 30px 90px rgb(15 23 42 / 0.18);
		--preview-highlight: rgb(255 255 255 / 0.72);
		--preview-meta: rgb(53 65 88 / 0.58);
		--preview-strong: rgb(24 35 57 / 0.9);

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
		--preview-scene-start: rgb(255 245 236 / 0.97);
		--preview-scene-end: rgb(242 219 198 / 0.9);
		--preview-glow: rgb(198 124 77 / 0.18);
	}

	.project-desktop-preview[data-accent='green'] {
		--preview-shell-start: rgb(245 251 248 / 0.95);
		--preview-shell-end: rgb(219 240 231 / 0.82);
		--preview-scene-start: rgb(243 251 247 / 0.96);
		--preview-scene-end: rgb(210 236 224 / 0.9);
		--preview-glow: rgb(17 140 122 / 0.2);
	}

	.project-desktop-preview[data-accent='cool'] {
		--preview-shell-start: rgb(242 245 255 / 0.95);
		--preview-shell-end: rgb(221 228 251 / 0.82);
		--preview-scene-start: rgb(243 246 255 / 0.97);
		--preview-scene-end: rgb(214 223 252 / 0.88);
		--preview-glow: rgb(96 118 255 / 0.18);
	}

	.project-desktop-preview[data-accent='sky'] {
		--preview-shell-start: rgb(242 252 252 / 0.95);
		--preview-shell-end: rgb(221 241 246 / 0.82);
		--preview-scene-start: rgb(242 252 253 / 0.96);
		--preview-scene-end: rgb(212 239 245 / 0.9);
		--preview-glow: rgb(52 167 218 / 0.18);
	}

	.project-desktop-preview[data-accent='violet'] {
		--preview-shell-start: rgb(246 242 255 / 0.94);
		--preview-shell-end: rgb(232 221 255 / 0.82);
		--preview-scene-start: rgb(245 240 255 / 0.97);
		--preview-scene-end: rgb(227 214 255 / 0.9);
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
		background:
			linear-gradient(160deg, var(--preview-shell-start), var(--preview-shell-end)),
			radial-gradient(circle at top, rgb(255 255 255 / 0.28), transparent 48%);
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

	.preview-carousel {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.preview-carousel__meta,
	.preview-carousel__footer {
		position: absolute;
		left: clamp(0.8rem, 1.35vw, 1rem);
		right: clamp(0.8rem, 1.35vw, 1rem);
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.preview-carousel__meta {
		top: clamp(0.8rem, 1.35vw, 1rem);
	}

	.preview-carousel__footer {
		bottom: clamp(0.8rem, 1.35vw, 1rem);
	}

	.preview-carousel__pill {
		display: inline-flex;
		align-items: center;
		padding: 0.38rem 0.7rem;
		border-radius: 999px;
		background: hsl(0 0% 100% / 0.58);
		backdrop-filter: blur(18px);
		color: hsl(222 20% 18% / 0.8);
		font-family: var(--font-display);
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.preview-carousel__count {
		color: var(--preview-meta);
		font-family: var(--font-display);
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.preview-carousel__viewport {
		width: 100%;
		height: 100%;
	}

	.preview-carousel__slide {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		border-radius: clamp(1rem, 2vw, 1.45rem);
		overflow: hidden;
		background:
			linear-gradient(160deg, var(--preview-scene-start), var(--preview-scene-end)),
			radial-gradient(circle at top, rgb(255 255 255 / 0.32), transparent 52%);
	}

	.preview-carousel__slide::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.46),
			inset 0 1px 0 rgb(255 255 255 / 0.58);
		pointer-events: none;
	}

	.preview-carousel__slide[data-surface='desktop'] {
		padding: 0;
	}

	.preview-carousel__slide[data-surface='mobile'],
	.preview-carousel__slide[data-kind='text'] {
		padding: clamp(1rem, 2.2vw, 1.45rem);
	}

	.preview-carousel__media {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: linear-gradient(180deg, rgb(227 233 242), rgb(242 245 248));
	}

	.preview-carousel__slide[data-fit='contain'] .preview-carousel__media {
		object-fit: contain;
	}

	.preview-carousel__slide[data-surface='mobile'][data-fit='contain'] .preview-carousel__media {
		object-position: top center;
	}

	.preview-carousel__device {
		position: relative;
		width: min(46%, 7.85rem);
		padding: 0.38rem;
		border-radius: 1.95rem;
		background: linear-gradient(180deg, rgb(26 35 52 / 0.96), rgb(10 14 25 / 0.94));
		box-shadow:
			0 24px 52px rgb(15 23 42 / 0.24),
			inset 0 1px 0 rgb(255 255 255 / 0.08);
	}

	.preview-carousel__device-notch {
		position: absolute;
		top: 0.45rem;
		left: 50%;
		width: 34%;
		height: 0.42rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.12);
		transform: translateX(-50%);
		z-index: 1;
	}

	.preview-carousel__device-screen {
		width: 100%;
		aspect-ratio: var(--project-preview-device-screen-aspect-ratio, 0.5);
		border-radius: 1.57rem;
		overflow: hidden;
		background:
			radial-gradient(circle at top, rgb(255 255 255 / 0.2), transparent 40%),
			linear-gradient(180deg, rgb(243 246 249), rgb(220 229 238));
	}

	.preview-carousel__text-slide {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.85rem;
		height: 100%;
		padding: clamp(1rem, 2.1vw, 1.5rem);
		text-align: center;
	}

	.preview-carousel__text-slide p {
		max-width: 13ch;
		color: var(--preview-strong);
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2vw, 1.85rem);
		font-weight: 700;
		line-height: 0.95;
		letter-spacing: -0.04em;
		text-wrap: balance;
	}

	.preview-carousel__progress {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.preview-carousel__dot {
		display: block;
		width: 0.9rem;
		height: 0.28rem;
		border-radius: 999px;
		background: rgb(53 65 88 / 0.14);
	}

	.preview-carousel__dot.is-active {
		width: 1.55rem;
		background: rgb(53 65 88 / 0.54);
	}

	@media (prefers-reduced-motion: reduce) {
		.project-desktop-preview,
		.preview-carousel__dot {
			transition: none;
		}
	}
</style>
