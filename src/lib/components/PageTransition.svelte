<script lang="ts">
	import {
		pageTransition,
		PANEL_COUNT,
		COVER_DURATION_MS,
		COVER_STAGGER_MS,
		REVEAL_DURATION_MS,
		REVEAL_STAGGER_MS,
		WAVE_OFFSET_MS
	} from '$lib/utils/page-transition.svelte';

	const panels = Array.from({ length: PANEL_COUNT }, (_, index) => index);
</script>

<div
	class="page-transition"
	data-phase={pageTransition.phase}
	aria-hidden="true"
	style:--panel-count={PANEL_COUNT}
	style:--cover-duration={`${COVER_DURATION_MS}ms`}
	style:--cover-stagger={`${COVER_STAGGER_MS}ms`}
	style:--reveal-duration={`${REVEAL_DURATION_MS}ms`}
	style:--reveal-stagger={`${REVEAL_STAGGER_MS}ms`}
	style:--wave-offset={`${WAVE_OFFSET_MS}ms`}
>
	{#each pageTransition.waves as color, waveIndex (waveIndex)}
		<div
			class="page-transition__wave"
			style:--wave-color={color}
			style:--wave-index={waveIndex}
			style:z-index={waveIndex}
		>
			{#each panels as index (index)}
				<span class="page-transition__panel" style:--panel-index={index}></span>
			{/each}
		</div>
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

	/* Each wave is a full-viewport sweep in a single colour. Waves stack via
	   z-index so the last (background) sweep settles on top, keeping the reveal
	   seamless against the new page. */
	.page-transition__wave {
		position: absolute;
		inset: 0;
	}

	.page-transition__panel {
		position: absolute;
		top: 0;
		height: 100%;
		/* 1px of horizontal overlap hides hairline gaps between panels while they
		   wipe; since every panel in a wave shares one colour the overlap is
		   invisible. */
		width: calc(100% / var(--panel-count) + 1px);
		left: calc(var(--panel-index) * (100% / var(--panel-count)) - 0.5px);
		background: var(--wave-color);
		/* Parked just below the viewport when idle. */
		transform: translate3d(0, 110%, 0);
		will-change: transform;
	}

	/* Snap back to the parked position instantly (no animation through the
	   viewport) once a transition completes. */
	.page-transition[data-phase='idle'] .page-transition__panel {
		transition: none;
	}

	/* Wipe up from the bottom to fully cover the viewport. Each successive wave
	   starts one --wave-offset later so the coloured sweeps follow in quick
	   succession. */
	.page-transition[data-phase='covering'] .page-transition__panel,
	.page-transition[data-phase='covered'] .page-transition__panel {
		transform: translate3d(0, 0, 0);
		transition: transform var(--cover-duration) cubic-bezier(0.76, 0, 0.24, 1);
		transition-delay: calc(
			var(--wave-index) * var(--wave-offset) + var(--panel-index) * var(--cover-stagger)
		);
	}

	/* Continue up and off the top to reveal the freshly mounted page. All waves
	   lift together (no wave offset) so the topmost background sweep reads as a
	   single clean reveal. */
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
