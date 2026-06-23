<script lang="ts">
	import { resolve } from '$app/paths';
	import ThemeToggle from '$lib/components/home/ThemeToggle.svelte';
	import type { ThemeName } from '$lib/utils/theme';

	interface Props {
		theme: ThemeName;
		onToggle: () => void;
		introActive?: boolean;
		introStaggerMs?: number;
	}

	let { theme, onToggle, introActive = true, introStaggerMs = 100 }: Props = $props();
</script>

<header
	class="project-page-topbar"
	data-intro={introActive ? 'active' : 'pending'}
	style:--project-page-topbar-intro-stagger={`${introStaggerMs}ms`}
	aria-label="Project page top bar"
>
	<div class="project-page-topbar__intro-item" style:--project-page-topbar-intro-index={0}>
		<a class="project-page-topbar__brand" href={resolve('/')}>Studio Zohdi</a>
	</div>
	<div
		class="project-page-topbar__rule"
		style:--project-page-topbar-intro-index={1}
		aria-hidden="true"
	></div>

	<div class="project-page-topbar__desktop">
		<div class="project-page-topbar__intro-item" style:--project-page-topbar-intro-index={2}>
			<ThemeToggle {theme} {onToggle} />
		</div>
		<div class="project-page-topbar__intro-item" style:--project-page-topbar-intro-index={3}>
			<a
				class="project-page-topbar__text-control project-page-topbar__text-control--cta"
				href="mailto:jake@studio-zohdi-llc.com"
			>
				LET'S TALK!
			</a>
		</div>
	</div>

	<div class="project-page-topbar__mobile">
		<div class="project-page-topbar__intro-item" style:--project-page-topbar-intro-index={1}>
			<ThemeToggle {theme} {onToggle} variant="compact" />
		</div>
	</div>
</header>

<style>
	.project-page-topbar {
		display: flex;
		align-items: center;
		gap: clamp(0.85rem, 2vw, 1.2rem);
		padding-block: 0.35rem 1.15rem;
	}

	.project-page-topbar__intro-item,
	.project-page-topbar__rule {
		opacity: 1;
		will-change: opacity, transform, filter;
		transition:
			opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 820ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 720ms ease;
		transition-delay: calc(
			var(--project-page-topbar-intro-index, 0) * var(--project-page-topbar-intro-stagger, 100ms)
		);
	}

	.project-page-topbar__intro-item {
		display: inline-flex;
		align-items: center;
		min-width: 0;
	}

	.project-page-topbar__rule {
		transform-origin: left center;
	}

	:global(html[data-js='true'])
		.project-page-topbar[data-intro='pending']
		.project-page-topbar__intro-item {
		opacity: 0;
		filter: blur(0.3rem);
		transform: translate3d(0, -0.9rem, 0);
	}

	:global(html[data-js='true'])
		.project-page-topbar[data-intro='pending']
		.project-page-topbar__rule {
		opacity: 0;
		transform: scaleX(0.76);
	}

	:global(html[data-js='true'])
		.project-page-topbar[data-intro='active']
		.project-page-topbar__intro-item,
	:global(html[data-js='true'])
		.project-page-topbar[data-intro='active']
		.project-page-topbar__rule {
		opacity: 1;
		filter: none;
		transform: none;
	}

	.project-page-topbar__brand {
		display: inline-flex;
		align-items: center;
		font-family: var(--font-display);
		font-size: clamp(0.82rem, 1vw, 0.94rem);
		font-weight: 600;
		letter-spacing: 0.12em;
		line-height: 1;
		white-space: nowrap;
		color: hsl(var(--foreground) / 0.92);
		transition:
			color 180ms ease,
			opacity 180ms ease;
	}

	.project-page-topbar__brand:hover {
		color: hsl(var(--foreground));
	}

	.project-page-topbar__rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, hsl(var(--foreground) / 0.16), transparent 72%);
	}

	.project-page-topbar__desktop,
	.project-page-topbar__mobile {
		display: flex;
		align-items: center;
		gap: clamp(0.9rem, 2vw, 1.5rem);
	}

	.project-page-topbar__mobile {
		display: none;
		margin-inline-start: auto;
	}

	.project-page-topbar__text-control {
		display: inline-flex;
		align-items: center;
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.22em;
		text-decoration: none;
		text-transform: uppercase;
		white-space: nowrap;
		transition:
			color 180ms ease,
			opacity 180ms ease;
	}

	.project-page-topbar__text-control--cta {
		color: hsl(var(--pink) / 0.74);
	}

	.project-page-topbar__text-control--cta:hover {
		color: hsl(var(--pink) / 0.92);
	}

	@media (prefers-reduced-motion: reduce) {
		.project-page-topbar__intro-item,
		.project-page-topbar__rule {
			transition: none;
		}

		:global(html[data-js='true'])
			.project-page-topbar[data-intro='pending']
			.project-page-topbar__intro-item,
		:global(html[data-js='true'])
			.project-page-topbar[data-intro='pending']
			.project-page-topbar__rule {
			opacity: 1;
			filter: none;
			transform: none;
		}
	}

	@media (max-width: 900px) {
		.project-page-topbar {
			padding-block: 0.15rem 0.9rem;
		}

		.project-page-topbar__rule,
		.project-page-topbar__desktop {
			display: none;
		}

		.project-page-topbar__brand {
			font-size: 0.8rem;
			letter-spacing: 0.1em;
		}

		.project-page-topbar__mobile {
			display: flex;
		}
	}
</style>
