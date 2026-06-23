<script lang="ts">
	import {
		pageTransition,
		PANEL_COUNT,
		COVER_DURATION_MS,
		COVER_STAGGER_MS,
		REVEAL_DURATION_MS,
		REVEAL_STAGGER_MS
	} from '$lib/utils/page-transition.svelte';

	const panels = Array.from({ length: PANEL_COUNT }, (_, index) => index);
</script>

<div
	class="page-transition"
	data-phase={pageTransition.phase}
	aria-hidden="true"
	style:--cover-color={pageTransition.color}
	style:--panel-count={PANEL_COUNT}
	style:--cover-duration={`${COVER_DURATION_MS}ms`}
	style:--cover-stagger={`${COVER_STAGGER_MS}ms`}
	style:--reveal-duration={`${REVEAL_DURATION_MS}ms`}
	style:--reveal-stagger={`${REVEAL_STAGGER_MS}ms`}
>
	{#each panels as index (index)}
		<span class="page-transition__panel" style:--panel-index={index}></span>
	{/each}
</div>

<style>
	.page-transition {
		position: fixed;
		inset: 0;
		z-index: 1000;
		pointer-events: none;
		overflow: hidden;
	}

	.page-transition[data-phase='covering'],
	.page-transition[data-phase='covered'],
	.page-transition[data-phase='revealing'] {
		pointer-events: auto;
	}

	.page-transition__panel {
		position: absolute;
		top: 0;
		height: 100%;
		/* 1px of horizontal overlap hides hairline gaps between panels while they
		   wipe; since every panel shares one colour the overlap is invisible. */
		width: calc(100% / var(--panel-count) + 1px);
		left: calc(var(--panel-index) * (100% / var(--panel-count)) - 0.5px);
		background: var(--cover-color);
		/* Parked just below the viewport when idle. */
		transform: translate3d(0, 110%, 0);
		will-change: transform;
	}

	/* Snap back to the parked position instantly (no animation through the
	   viewport) once a transition completes. */
	.page-transition[data-phase='idle'] .page-transition__panel {
		transition: none;
	}

	/* Wipe up from the bottom to fully cover the viewport. */
	.page-transition[data-phase='covering'] .page-transition__panel,
	.page-transition[data-phase='covered'] .page-transition__panel {
		transform: translate3d(0, 0, 0);
		transition: transform var(--cover-duration) cubic-bezier(0.76, 0, 0.24, 1);
		transition-delay: calc(var(--panel-index) * var(--cover-stagger));
	}

	/* Continue up and off the top to reveal the freshly mounted page. */
	.page-transition[data-phase='revealing'] .page-transition__panel {
		transform: translate3d(0, -110%, 0);
		transition: transform var(--reveal-duration) cubic-bezier(0.76, 0, 0.24, 1);
		transition-delay: calc(var(--panel-index) * var(--reveal-stagger));
	}

	@media (prefers-reduced-motion: reduce) {
		.page-transition__panel {
			transition: none !important;
		}
	}
</style>
