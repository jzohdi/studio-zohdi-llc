<script lang="ts">
	import ThemeToggle from '$lib/components/home/ThemeToggle.svelte';
	import type { ThemeName } from '$lib/utils/theme';

	interface Props {
		theme: ThemeName;
		onToggle: () => void;
	}

	let { theme, onToggle }: Props = $props();
</script>

<header class="topbar container" aria-label="Top bar">
	<div class="topbar__rule" aria-hidden="true"></div>

	<div class="topbar__desktop">
		<ThemeToggle {theme} {onToggle} />
		<a
			class="topbar__text-control topbar__text-control--cta"
			href="mailto:jake@studio-zohdi-llc.com"
		>
			LET'S TALK!
		</a>
	</div>

	<div class="topbar__mobile">
		<ThemeToggle {theme} {onToggle} variant="compact" />
	</div>
</header>

<style>
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
		display: inline-flex;
		align-items: center;
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.22em;
		text-decoration: none;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.topbar__text-control--cta {
		color: hsl(var(--pink) / 0.74);
	}

	@media (max-width: 900px) {
		.topbar {
			position: absolute;
			inset-block-start: var(--page-padding-block);
			inset-inline: 0;
			z-index: 5;
			padding-block: 0;
		}

		.topbar__rule,
		.topbar__desktop {
			display: none;
		}

		.topbar__mobile {
			display: flex;
			width: 100%;
			align-items: flex-start;
			justify-content: flex-end;
		}
	}
</style>
