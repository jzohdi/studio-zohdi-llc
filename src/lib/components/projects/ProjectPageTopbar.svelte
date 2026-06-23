<script lang="ts">
	import ThemeToggle from '$lib/components/home/ThemeToggle.svelte';
	import type { ThemeName } from '$lib/utils/theme';

	interface Props {
		theme: ThemeName;
		onToggle: () => void;
	}

	let { theme, onToggle }: Props = $props();
</script>

<header class="project-page-topbar" aria-label="Project page top bar">
	<a class="project-page-topbar__brand" href="/">Studio Zohdi</a>
	<div class="project-page-topbar__rule" aria-hidden="true"></div>

	<div class="project-page-topbar__desktop">
		<ThemeToggle {theme} {onToggle} />
		<a
			class="project-page-topbar__text-control project-page-topbar__text-control--cta"
			href="mailto:jake@studio-zohdi-llc.com"
		>
			LET'S TALK!
		</a>
	</div>

	<div class="project-page-topbar__mobile">
		<ThemeToggle {theme} {onToggle} variant="compact" />
	</div>
</header>

<style>
	.project-page-topbar {
		display: flex;
		align-items: center;
		gap: clamp(0.85rem, 2vw, 1.2rem);
		padding-block: 0.35rem 1.15rem;
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
