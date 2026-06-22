<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import BrandBlock from '$lib/components/home/BrandBlock.svelte';
	import MobileShowcase from '$lib/components/home/MobileShowcase.svelte';
	import ProjectDesktopPreview from '$lib/components/home/ProjectDesktopPreview.svelte';
	import { preloadProjectPreviewAssets } from '$lib/components/home/project-preview-assets';
	import Topbar from '$lib/components/home/Topbar.svelte';
	import { defaultFeaturedProjectId, featuredProjects } from '$lib/data/featured-projects';
	import {
		applyTheme,
		persistTheme,
		resolveTheme,
		toggleTheme,
		type ThemeName
	} from '$lib/utils/theme';

	const fallbackProject = featuredProjects[0]!;
	const hoverTagOffsetX = 24;
	const hoverTagOffsetY = 18;
	const desktopShowcaseMediaQuery = new MediaQuery('(min-width: 901px)', false);

	let theme = $state<ThemeName>('light');
	let activeProjectId = $state(defaultFeaturedProjectId);
	let showHoverTag = $state(false);
	let hoverTagX = $state(0);
	let hoverTagY = $state(0);
	let activeProject = $derived(
		featuredProjects.find((project) => project.id === activeProjectId) ?? fallbackProject
	);

	$effect(() => {
		const isDesktopShowcaseActive = desktopShowcaseMediaQuery.current;
		if (!isDesktopShowcaseActive) return;

		for (const project of featuredProjects) {
			preloadProjectPreviewAssets(project.id, 'first', 'low');
		}
	});

	$effect(() => {
		const isDesktopShowcaseActive = desktopShowcaseMediaQuery.current;
		if (!isDesktopShowcaseActive) return;
		const currentProjectId = activeProjectId;

		preloadProjectPreviewAssets(currentProjectId, 'all', 'high');
	});

	onMount(() => {
		const resolvedTheme = resolveTheme();
		theme = resolvedTheme;
		applyTheme(resolvedTheme);
	});

	function setActiveProject(projectId: string) {
		activeProjectId = projectId;
	}

	function updateHoverTagPosition(event: PointerEvent) {
		hoverTagX = event.clientX + hoverTagOffsetX;
		hoverTagY = event.clientY + hoverTagOffsetY;
	}

	function handleProjectPointerEnter(projectId: string, event: PointerEvent) {
		setActiveProject(projectId);

		if (event.pointerType !== 'mouse') return;

		updateHoverTagPosition(event);
		showHoverTag = true;
	}

	function handleDesktopPointerMove(event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;

		updateHoverTagPosition(event);
		showHoverTag = true;
	}

	function hideHoverTag() {
		showHoverTag = false;
	}

	function handleThemeToggle() {
		theme = toggleTheme(theme);
		applyTheme(theme);
		persistTheme(theme);
	}
</script>

<svelte:head>
	<title>Studio Zohdi | Premium freelance web development</title>
	<meta
		name="description"
		content="Studio Zohdi is a premium freelance web development studio showcasing recent client work across product, commerce, creative, and energy experiences."
	/>
</svelte:head>

<div class="home-shell">
	<Topbar {theme} onToggle={handleThemeToggle} />

	<main class="container home-main">
		<section class="home-hero" aria-labelledby="homepage-title">
			<BrandBlock projectCount={featuredProjects.length} />

			<section class="desktop-showcase" aria-labelledby="desktop-projects-heading">
				<h2 id="desktop-projects-heading" class="sr-only">Featured projects</h2>

				<div
					class="desktop-showcase__surface"
					role="presentation"
					style:--project-count={featuredProjects.length}
					onpointermove={handleDesktopPointerMove}
					onpointerleave={hideHoverTag}
				>
					{#each featuredProjects as project, index (project.id)}
						<button
							type="button"
							class={`project-button ${project.id === activeProjectId ? 'is-active' : ''}`}
							id={`project-trigger-${project.id}`}
							style:grid-row={index + 1}
							aria-pressed={project.id === activeProjectId}
							onclick={() => setActiveProject(project.id)}
							onfocus={() => setActiveProject(project.id)}
							onpointerenter={(event) => handleProjectPointerEnter(project.id, event)}
						>
							<span class="project-button__name">
								{#each project.nameLines as line (line)}
									<span class="project-button__line">{line}</span>
								{/each}
							</span>
						</button>
					{/each}

					<div
						class="desktop-showcase__stage"
						aria-labelledby={`project-trigger-${activeProject.id}`}
					>
						<div class="desktop-showcase__stage-track">
							{#each featuredProjects as project (project.id)}
								<article
									class={`stage-panel ${project.id === activeProjectId ? 'is-active' : ''}`}
									aria-hidden={project.id !== activeProjectId}
								>
									<ProjectDesktopPreview {project} isActive={project.id === activeProjectId} />
								</article>
							{/each}
						</div>
					</div>
				</div>

				<div
					class={`desktop-hover-tag ${showHoverTag ? 'is-visible' : ''}`}
					style:--hover-tag-x={`${hoverTagX}px`}
					style:--hover-tag-y={`${hoverTagY}px`}
					aria-hidden="true"
				>
					MORE INFO
				</div>
			</section>

			<MobileShowcase />
		</section>
	</main>
</div>

<style>
	.home-shell {
		min-height: 100svh;
		padding-block: var(--page-padding-block) clamp(1.75rem, 4vw, 3rem);
	}

	.home-main {
		padding-bottom: clamp(1.5rem, 4vw, 3.25rem);
	}

	.home-hero {
		display: grid;
		gap: clamp(1.25rem, 3vw, 2rem);
	}

	.desktop-showcase {
		--showcase-stage-width: clamp(27rem, 35vw, 34rem);
		--showcase-gap: clamp(1rem, 2.4vw, 1.9rem);

		position: relative;
	}

	.desktop-showcase__surface {
		display: grid;
		grid-template-columns: minmax(0, 1fr) var(--showcase-stage-width);
		grid-template-rows: repeat(var(--project-count), auto);
		column-gap: var(--showcase-gap);
		align-content: start;
	}

	.project-button {
		grid-column: 1 / -1;
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: minmax(0, 1fr) var(--showcase-stage-width);
		column-gap: var(--showcase-gap);
		align-items: start;
		width: 100%;
		padding-block: 0.1rem;
		text-align: left;
		color: hsl(var(--foreground) / 0.18);
		cursor: pointer;
		transition: color 220ms ease;
	}

	.project-button:hover,
	.project-button:focus-visible,
	.project-button.is-active {
		color: hsl(var(--foreground));
	}

	.project-button__name {
		grid-column: 1;
		display: block;
	}

	.project-button__line {
		display: block;
		font-family: var(--font-display);
		font-size: 5.25rem;
		font-weight: 700;
		line-height: 0.86;
		letter-spacing: -0.04em;
		transition: transform 220ms ease;
	}

	.project-button:hover .project-button__line,
	.project-button:focus-visible .project-button__line,
	.project-button.is-active .project-button__line {
		transform: translateX(0.12rem);
	}

	.desktop-showcase__stage {
		position: fixed;
		top: 50svh;
		right: calc((100vw - min(100vw, var(--page-max-width))) / 2 + var(--page-padding-inline));
		width: var(--showcase-stage-width);
		transform: translateY(-50%);
		z-index: 1;
		pointer-events: none;
	}

	.desktop-showcase__stage-track {
		display: grid;
		justify-items: end;
		align-items: center;
	}

	.stage-panel {
		grid-area: 1 / 1;
		width: 100%;
		opacity: 0;
		transform: translateY(1rem) scale(0.985);
		pointer-events: none;
		transition:
			opacity 260ms ease,
			transform 260ms ease;
	}

	.stage-panel.is-active {
		opacity: 1;
		transform: none;
	}

	.desktop-hover-tag {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 20;
		padding: 0.7rem 1.05rem;
		border-radius: 0.65rem;
		background: hsl(var(--pink));
		box-shadow: 0 20px 44px hsl(var(--pink) / 0.28);
		color: hsl(0 0% 100% / 0.97);
		font-family: var(--font-display);
		font-size: clamp(0.8rem, 0.88vw, 0.98rem);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transform: translate3d(var(--hover-tag-x, 0px), var(--hover-tag-y, 0px), 0) rotate(-5deg)
			skewX(-10deg) scale(0.92);
		transform-origin: center;
		transition:
			opacity 180ms ease,
			transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.desktop-hover-tag.is-visible {
		opacity: 1;
		transform: translate3d(var(--hover-tag-x, 0px), var(--hover-tag-y, 0px), 0) rotate(-5deg)
			skewX(-10deg) scale(1);
	}

	@media (max-width: 900px) {
		.desktop-showcase {
			display: none;
		}

		.desktop-hover-tag {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-button,
		.project-button__line,
		.stage-panel,
		.desktop-hover-tag {
			transition-duration: 0ms;
		}
	}
</style>
