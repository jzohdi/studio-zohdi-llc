<script lang="ts">
	import { onMount } from 'svelte';
	import ProjectDesktopPreview from '$lib/components/home/ProjectDesktopPreview.svelte';
	import ProjectMobilePreview from '$lib/components/home/ProjectMobilePreview.svelte';
	import ThemeToggle from '$lib/components/home/ThemeToggle.svelte';
	import { defaultFeaturedProjectId, featuredProjects } from '$lib/data/featured-projects';
	import {
		applyTheme,
		persistTheme,
		resolveTheme,
		toggleTheme,
		type ThemeName
	} from '$lib/utils/theme';

	const fallbackProject = featuredProjects[0]!;
	const projectCountLabel = featuredProjects.length.toString().padStart(2, '0');
	const hoverTagOffsetX = 24;
	const hoverTagOffsetY = 18;

	let theme = $state<ThemeName>('light');
	let activeProjectId = $state(defaultFeaturedProjectId);
	let showHoverTag = $state(false);
	let hoverTagX = $state(0);
	let hoverTagY = $state(0);
	let activeProject = $derived(
		featuredProjects.find((project) => project.id === activeProjectId) ?? fallbackProject
	);

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
	<header class="topbar container" aria-label="Top bar">
		<div class="topbar__rule" aria-hidden="true"></div>

		<div class="topbar__desktop">
			<ThemeToggle {theme} onToggle={handleThemeToggle} />
			<span class="topbar__text-control">MENU</span>
			<span class="topbar__text-control topbar__text-control--cta">LET'S TALK!</span>
		</div>

		<div class="topbar__mobile">
			<span class="topbar__text-control">MENU</span>
			<ThemeToggle {theme} onToggle={handleThemeToggle} variant="compact" />
		</div>
	</header>

	<main class="container home-main">
		<section class="home-hero" aria-labelledby="homepage-title">
			<div class="brand-block">
				<h1 id="homepage-title" class="brand-block__title">
					<span>STUDIO</span>
					<span>ZOHDI</span>
				</h1>
				<p class="brand-block__count eyebrow">RECENT PROJECTS ({projectCountLabel})</p>
			</div>

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

			<section class="mobile-showcase" aria-labelledby="mobile-projects-heading">
				<h2 id="mobile-projects-heading" class="sr-only">Recent projects</h2>

				<ul class="mobile-showcase__list">
					{#each featuredProjects as project (project.id)}
						<li>
							<article class="project-row">
								<div class="project-row__copy">
									<h2>{project.name}</h2>
									<p>{project.summary}</p>
								</div>

								<div class="project-row__visual">
									<ProjectMobilePreview {project} />
								</div>
							</article>
						</li>
					{/each}
				</ul>
			</section>
		</section>
	</main>
</div>

<style>
	.home-shell {
		min-height: 100svh;
		padding-block: var(--page-padding-block) clamp(1.75rem, 4vw, 3rem);
	}

	.topbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-block: 0.35rem 1.15rem;
	}

	.topbar__rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, hsl(var(--foreground) / 0.16), transparent 72%);
	}

	.topbar__desktop,
	.topbar__mobile {
		display: flex;
		align-items: center;
		gap: clamp(0.9rem, 2vw, 1.5rem);
	}

	.topbar__mobile {
		display: none;
	}

	.topbar__text-control {
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.topbar__text-control--cta {
		color: hsl(var(--pink) / 0.74);
	}

	.home-main {
		padding-bottom: clamp(1.5rem, 4vw, 3.25rem);
	}

	.home-hero {
		display: grid;
		gap: clamp(1.25rem, 3vw, 2rem);
	}

	.brand-block {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 0.7rem 1.35rem;
		padding-top: 0.2rem;
	}

	.brand-block__title {
		display: grid;
		gap: 0.18rem;
		font-size: clamp(0.78rem, 1vw, 0.9rem);
		font-weight: 600;
		line-height: 0.92;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}

	.brand-block__count {
		font-family: var(--font-display);
		font-size: clamp(0.72rem, 1vw, 0.82rem);
		font-weight: 500;
		letter-spacing: 0.22em;
		color: hsl(var(--muted-foreground));
		text-transform: uppercase;
	}

	.desktop-showcase {
		--showcase-stage-width: clamp(23rem, 29vw, 28.25rem);
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

	.mobile-showcase__list {
		list-style: none;
		margin: 0;
		padding: 0;
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
		padding: 0.6rem 1.05rem;
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

	.mobile-showcase {
		display: none;
	}

	.mobile-showcase__list {
		display: grid;
		gap: 0;
	}

	.mobile-showcase__list li + li {
		border-top: 1px solid hsl(var(--foreground) / 0.08);
	}

	.project-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.95rem;
		align-items: center;
		padding: 1rem 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		backdrop-filter: none;
		box-shadow: none;
	}

	.project-row__copy {
		padding-left: 0;
	}

	.project-row__copy h2 {
		font-size: clamp(1.25rem, 6vw, 1.9rem);
		font-weight: 700;
		line-height: 0.94;
		letter-spacing: -0.04em;
	}

	.project-row__copy p {
		margin-top: 0.45rem;
		max-width: 14rem;
		color: hsl(var(--foreground) / 0.58);
		font-size: 0.88rem;
		line-height: 1.45;
	}

	.project-row__visual {
		width: min(38vw, 9.9rem);
	}

	@media (max-width: 900px) {
		.topbar {
			padding-bottom: 1rem;
		}

		.topbar__rule,
		.topbar__desktop,
		.desktop-showcase {
			display: none;
		}

		.topbar__mobile {
			display: flex;
			width: 100%;
			justify-content: space-between;
		}

		.mobile-showcase {
			display: block;
		}

		.desktop-hover-tag {
			display: none;
		}
	}

	@media (max-width: 560px) {
		.project-row {
			grid-template-columns: minmax(0, 1fr) minmax(8.25rem, 36vw);
			padding: 0.9rem 0;
		}

		.project-row__visual {
			width: 100%;
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
