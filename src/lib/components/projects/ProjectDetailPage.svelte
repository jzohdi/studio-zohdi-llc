<script lang="ts">
	import { onMount } from 'svelte';
	import ProjectMediaBento from '$lib/components/projects/ProjectMediaBento.svelte';
	import TextGenerateReveal from '$lib/components/projects/TextGenerateReveal.svelte';
	import ProjectTitleHoverEffect from '$lib/components/projects/ProjectTitleHoverEffect.svelte';
	import ProjectPageTopbar from '$lib/components/projects/ProjectPageTopbar.svelte';
	import type { ProjectPage } from '$lib/data/project-pages';
	import {
		applyTheme,
		persistTheme,
		resolveTheme,
		toggleTheme,
		type ThemeName
	} from '$lib/utils/theme';
	import { runAfterInitialPaint } from '$lib/utils/after-paint';

	interface Props {
		project: ProjectPage;
	}

	const projectInfoLabel = 'Project infos';
	const titleIntroDelayMs = 160;
	const topbarIntroStaggerMs = 110;
	const infoLabelStartDelayMs = 280;
	const infoLabelWordStaggerMs = 150;
	const infoLabelWordDurationMs = 500;
	const infoParagraphWordStaggerMs = 96;
	const infoParagraphWordDurationMs = 620;
	const infoBlockGapMs = 130;
	const ctaIntroGapMs = 140;

	let introStarted = $state(false);
	let theme = $state<ThemeName>('light');
	let { project }: Props = $props();

	function countRevealWords(text: string) {
		return text.trim().split(/\s+/).filter(Boolean).length;
	}

	function estimateRevealDuration(text: string, wordStaggerMs: number, wordDurationMs: number) {
		return wordDurationMs + Math.max(0, countRevealWords(text) - 1) * wordStaggerMs;
	}

	let infoParagraphStartDelays = $derived.by(() => {
		let nextDelay =
			infoLabelStartDelayMs +
			estimateRevealDuration(projectInfoLabel, infoLabelWordStaggerMs, infoLabelWordDurationMs) +
			60;

		return project.infoParagraphs.map((paragraph) => {
			const currentDelay = nextDelay;
			nextDelay +=
				estimateRevealDuration(paragraph, infoParagraphWordStaggerMs, infoParagraphWordDurationMs) +
				infoBlockGapMs;
			return currentDelay;
		});
	});

	let introActive = $derived(introStarted);
	let ctaIntroDelayMs = $derived.by(() => {
		const lastParagraph = project.infoParagraphs[project.infoParagraphs.length - 1] ?? '';
		const lastParagraphDelay =
			infoParagraphStartDelays[project.infoParagraphs.length - 1] ?? infoLabelStartDelayMs;

		return (
			lastParagraphDelay +
			estimateRevealDuration(
				lastParagraph,
				infoParagraphWordStaggerMs,
				infoParagraphWordDurationMs
			) +
			ctaIntroGapMs
		);
	});

	onMount(() => {
		const resolvedTheme = resolveTheme();
		theme = resolvedTheme;
		applyTheme(resolvedTheme);

		const cancelIntro = runAfterInitialPaint(() => {
			introStarted = true;
		});

		return () => {
			cancelIntro();
		};
	});

	function handleThemeToggle() {
		theme = toggleTheme(theme);
		applyTheme(theme);
		persistTheme(theme);
	}
</script>

<svelte:head>
	<title>{project.name} | Studio Zohdi</title>
	<meta name="description" content={project.metaDescription} />
</svelte:head>

<main class="project-detail" data-accent={project.accent}>
	<div class="container project-detail__container">
		<ProjectPageTopbar
			{theme}
			onToggle={handleThemeToggle}
			{introActive}
			introStaggerMs={topbarIntroStaggerMs}
		/>

		<section class="project-detail__intro" aria-labelledby="project-detail-title">
			<div class="project-detail__masthead">
				<div
					class="project-detail__title-reveal"
					data-intro={introActive ? 'active' : 'pending'}
					style:--project-detail-intro-delay={`${titleIntroDelayMs}ms`}
				>
					<ProjectTitleHoverEffect
						id="project-detail-title"
						lines={project.nameLines}
						colorPrimary={project.titleHighlight.primary}
						colorSecondary={project.titleHighlight.secondary}
					/>
				</div>
			</div>

			<div class="project-detail__info-grid">
				<p class="project-detail__info-label eyebrow">
					<TextGenerateReveal
						text={projectInfoLabel}
						active={introActive}
						startDelayMs={infoLabelStartDelayMs}
						wordStaggerMs={infoLabelWordStaggerMs}
						wordDurationMs={infoLabelWordDurationMs}
					/>
				</p>

				<div class="project-detail__copy">
					{#each project.infoParagraphs as paragraph, index (paragraph)}
						<p>
							<TextGenerateReveal
								text={paragraph}
								active={introActive}
								startDelayMs={infoParagraphStartDelays[index] ?? infoLabelStartDelayMs}
								wordStaggerMs={infoParagraphWordStaggerMs}
								wordDurationMs={infoParagraphWordDurationMs}
							/>
						</p>
					{/each}

					<div
						class="project-detail__cta-wrap"
						data-intro={introActive ? 'active' : 'pending'}
						style:--project-detail-intro-delay={`${ctaIntroDelayMs}ms`}
					>
						{#if project.website}
							<a
								class="project-detail__cta eyebrow"
								href={project.website}
								target="_blank"
								rel="noreferrer noopener"
							>
								{project.websiteLabel}
								<span aria-hidden="true">→</span>
							</a>
						{:else}
							<span
								class="project-detail__cta project-detail__cta--disabled eyebrow"
								aria-disabled="true"
							>
								{project.websiteLabel}
							</span>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<ProjectMediaBento {project} revealReady={introActive} />
	</div>
</main>

<style>
	.project-detail {
		--project-accent: hsl(var(--pink));
		--project-page-background: 0 0% 100%;
		--project-page-foreground: 222.2 84% 4.9%;
		--project-page-muted-foreground: 215.4 16.3% 46.9%;
		--project-page-border: 214.3 31.8% 91.4%;
		--project-page-card: 0 0% 100%;
		--project-page-shadow: 0 18px 44px hsl(222 35% 20% / 0.12);

		--background: var(--project-page-background);
		--foreground: var(--project-page-foreground);
		--muted-foreground: var(--project-page-muted-foreground);
		--border: var(--project-page-border);
		--card: var(--project-page-card);
		--shadow-card: var(--project-page-shadow);

		min-height: 100svh;
		padding-block: clamp(1.2rem, 2.6vw, 1.75rem) clamp(4rem, 8vw, 7rem);
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.project-detail[data-accent='warm'] {
		--project-accent: rgb(198 124 77);
	}

	.project-detail[data-accent='green'] {
		--project-accent: rgb(17 140 122);
	}

	.project-detail[data-accent='cool'] {
		--project-accent: rgb(96 118 255);
	}

	.project-detail[data-accent='sky'] {
		--project-accent: rgb(52 167 218);
	}

	.project-detail[data-accent='violet'] {
		--project-accent: rgb(125 79 255);
	}

	:global(html[data-theme='dark']) .project-detail {
		--project-page-background: 220 14% 7%;
		--project-page-foreground: 0 0% 97%;
		--project-page-muted-foreground: 220 10% 72%;
		--project-page-border: 220 12% 18%;
		--project-page-card: 220 14% 9%;
		--project-page-shadow: 0 24px 56px hsl(0 0% 0% / 0.44);
	}

	.project-detail__container {
		display: grid;
	}

	.project-detail__intro {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		gap: clamp(3rem, 8vh, 7rem);
		min-height: clamp(20rem, 52svh, 40rem);
		padding-top: 0;
	}

	.project-detail__masthead {
		display: block;
	}

	.project-detail__title-reveal,
	.project-detail__cta-wrap {
		opacity: 1;
		filter: none;
		will-change: opacity, transform, filter;
		transition:
			opacity 860ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 960ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 820ms ease;
		transition-delay: var(--project-detail-intro-delay, 0ms);
	}

	.project-detail__title-reveal {
		display: inline-block;
		max-width: 100%;
		transform-origin: 0 100%;
	}

	.project-detail__cta-wrap {
		width: fit-content;
		transform-origin: 0 50%;
	}

	:global(html[data-js='true']) .project-detail__title-reveal[data-intro='pending'] {
		opacity: 0;
		filter: blur(0.62rem);
		transform: translate3d(0, 2.4rem, 0) scale(0.985);
	}

	:global(html[data-js='true']) .project-detail__cta-wrap[data-intro='pending'] {
		opacity: 0;
		filter: blur(0.28rem);
		transform: translate3d(0, 1rem, 0);
	}

	:global(html[data-js='true']) .project-detail__title-reveal[data-intro='active'],
	:global(html[data-js='true']) .project-detail__cta-wrap[data-intro='active'] {
		opacity: 1;
		filter: none;
		transform: none;
	}

	.project-detail__info-grid {
		display: grid;
		grid-template-columns: minmax(8.5rem, 0.24fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 5vw, 7rem);
		align-items: start;
	}

	.project-detail__info-label {
		color: hsl(var(--foreground) / 0.55);
	}

	.project-detail__copy {
		display: grid;
		gap: clamp(1rem, 2vw, 1.35rem);
		max-width: min(46rem, 100%);
	}

	.project-detail__copy p {
		color: hsl(var(--foreground) / 0.9);
		font-size: clamp(1.18rem, 2.25vw, 1.85rem);
		line-height: 1.42;
		letter-spacing: -0.03em;
		text-wrap: pretty;
	}

	.project-detail__cta {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		width: fit-content;
		margin-top: 0.35rem;
		color: hsl(var(--foreground) / 0.72);
		transition:
			color 180ms ease,
			transform 180ms ease,
			opacity 180ms ease;
	}

	.project-detail__cta:hover {
		color: var(--project-accent);
		transform: translateX(0.12rem);
	}

	.project-detail__cta--disabled {
		opacity: 0.42;
	}

	.project-detail__cta--disabled:hover {
		color: hsl(var(--foreground) / 0.72);
		transform: none;
	}

	@media (max-width: 900px) {
		.project-detail__intro {
			grid-template-rows: auto;
			min-height: auto;
			gap: clamp(2rem, 10vw, 3rem);
			padding-top: 0;
		}

		.project-detail__info-grid {
			grid-template-columns: 1fr;
		}

		.project-detail__copy p {
			font-size: clamp(1.05rem, 4.8vw, 1.28rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-detail__title-reveal,
		.project-detail__cta-wrap,
		.project-detail__cta {
			transition: none;
		}

		:global(html[data-js='true']) .project-detail__title-reveal[data-intro='pending'],
		:global(html[data-js='true']) .project-detail__cta-wrap[data-intro='pending'] {
			opacity: 1;
			filter: none;
			transform: none;
		}
	}
</style>
