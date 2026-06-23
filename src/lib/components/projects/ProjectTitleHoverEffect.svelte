<script module lang="ts">
	let nextProjectTitleHoverId = 0;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		id?: string;
		lines: string[];
		durationMs?: number;
		/** First highlight color (any CSS color). Defaults to the site pink. */
		colorPrimary?: string;
		/** Second highlight color (any CSS color). */
		colorSecondary?: string;
	}

	type TitleLineMetric = {
		text: string;
		x: number;
		y: number;
	};

	const instanceId = nextProjectTitleHoverId++;

	let {
		id,
		lines,
		durationMs = 240,
		colorPrimary = 'hsl(318, 78%, 53%)',
		colorSecondary = 'hsl(217, 91%, 60%)'
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let titleEl = $state<HTMLHeadingElement | null>(null);
	let hovered = $state(false);
	let hoverCycle = $state(0);
	let svgWidth = $state(0);
	let svgHeight = $state(0);
	let fontSizePx = $state(0);
	let fontWeight = $state('700');
	let fontFamily = $state('var(--font-display)');
	let letterSpacingPx = $state(0);
	let strokeWidthPx = $state(1.6);
	let overlayPaddingX = $state(0);
	let overlayPaddingY = $state(0);
	let lineMetrics = $state<TitleLineMetric[]>([]);
	let maskTargetX = $state(0);
	let maskTargetY = $state(0);
	let maskX = $state(0);
	let maskY = $state(0);

	let maskAnimationFrameId: number | null = null;
	let lastMaskFrameTime = 0;

	const gradientId = `project-title-gradient-${instanceId}`;
	const maskId = `project-title-mask-${instanceId}`;
	const revealGradientId = `project-title-reveal-${instanceId}`;
	const accessibleTitle = $derived(lines.join(' '));
	const maskRadius = $derived(Math.max(svgWidth, svgHeight) * 0.34);
	const defaultMaskX = $derived(overlayPaddingX + (svgWidth - overlayPaddingX * 2) / 2);
	const defaultMaskY = $derived(overlayPaddingY + (svgHeight - overlayPaddingY * 2) / 2);
	const hasOverlay = $derived(
		svgWidth > 0 && svgHeight > 0 && lineMetrics.length > 0 && fontSizePx > 0
	);

	function measureTitle() {
		if (!rootEl || !titleEl) {
			return;
		}

		const wrapperRect = rootEl.getBoundingClientRect();
		const lineNodes = titleEl.querySelectorAll<HTMLElement>('[data-project-title-line]');

		if (wrapperRect.width === 0 || wrapperRect.height === 0 || lineNodes.length === 0) {
			return;
		}

		const titleStyles = window.getComputedStyle(titleEl);
		const parsedFontSize = Number.parseFloat(titleStyles.fontSize);
		const parsedLetterSpacing = Number.parseFloat(titleStyles.letterSpacing);
		const resolvedFontSize = Number.isFinite(parsedFontSize) ? parsedFontSize : 0;
		const nextStrokeWidth = Math.max(1.6, resolvedFontSize * 0.028);
		const nextOverlayPaddingX = Math.ceil(Math.max(nextStrokeWidth * 3.2, resolvedFontSize * 0.06));
		const nextOverlayPaddingY = Math.ceil(Math.max(nextStrokeWidth * 2.2, resolvedFontSize * 0.09));

		svgWidth = Math.ceil(wrapperRect.width + nextOverlayPaddingX * 2);
		svgHeight = Math.ceil(wrapperRect.height + nextOverlayPaddingY * 2);
		fontSizePx = resolvedFontSize;
		fontWeight = titleStyles.fontWeight;
		fontFamily = titleStyles.fontFamily;
		letterSpacingPx = Number.isFinite(parsedLetterSpacing) ? parsedLetterSpacing : 0;
		strokeWidthPx = nextStrokeWidth;
		overlayPaddingX = nextOverlayPaddingX;
		overlayPaddingY = nextOverlayPaddingY;
		lineMetrics = [...lineNodes].map((node) => {
			const lineRect = node.getBoundingClientRect();

			return {
				text: node.dataset.projectTitleLine ?? node.textContent ?? '',
				x: lineRect.left - wrapperRect.left + nextOverlayPaddingX,
				y:
					lineRect.top -
					wrapperRect.top +
					lineRect.height / 2 +
					resolvedFontSize * 0.12 +
					nextOverlayPaddingY
			};
		});

		if (!hovered) {
			maskTargetX = nextOverlayPaddingX + wrapperRect.width / 2;
			maskTargetY = nextOverlayPaddingY + wrapperRect.height / 2;
			maskX = maskTargetX;
			maskY = maskTargetY;
		}
	}

	function animateMask(timestamp: number) {
		if (lastMaskFrameTime === 0) {
			lastMaskFrameTime = timestamp;
		}

		const frameDelta = timestamp - lastMaskFrameTime;
		lastMaskFrameTime = timestamp;
		const interpolation = 1 - Math.pow(0.01, frameDelta / durationMs);
		const nextMaskX = maskX + (maskTargetX - maskX) * interpolation;
		const nextMaskY = maskY + (maskTargetY - maskY) * interpolation;

		maskX = nextMaskX;
		maskY = nextMaskY;

		if (Math.abs(maskTargetX - nextMaskX) < 0.1 && Math.abs(maskTargetY - nextMaskY) < 0.1) {
			maskX = maskTargetX;
			maskY = maskTargetY;
			maskAnimationFrameId = null;
			lastMaskFrameTime = 0;
			return;
		}

		maskAnimationFrameId = window.requestAnimationFrame(animateMask);
	}

	function queueMaskAnimation() {
		if (maskAnimationFrameId !== null || typeof window === 'undefined') {
			return;
		}

		maskAnimationFrameId = window.requestAnimationFrame(animateMask);
	}

	function setMaskTarget(nextX: number, nextY: number) {
		maskTargetX = nextX;
		maskTargetY = nextY;
		queueMaskAnimation();
	}

	function handlePointerEnter(event: PointerEvent) {
		hovered = true;
		hoverCycle += 1;
		handlePointerMove(event);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!rootEl) {
			return;
		}

		const rect = rootEl.getBoundingClientRect();
		const nextX = event.clientX - rect.left + overlayPaddingX;
		const nextY = event.clientY - rect.top + overlayPaddingY;

		setMaskTarget(Math.min(svgWidth, Math.max(0, nextX)), Math.min(svgHeight, Math.max(0, nextY)));
	}

	function handlePointerLeave() {
		hovered = false;
		setMaskTarget(defaultMaskX, defaultMaskY);
	}

	function useRootElement(node: HTMLDivElement) {
		rootEl = node;

		return () => {
			if (rootEl === node) {
				rootEl = null;
			}
		};
	}

	function useTitleElement(node: HTMLHeadingElement) {
		titleEl = node;

		return () => {
			if (titleEl === node) {
				titleEl = null;
			}
		};
	}

	onMount(() => {
		measureTitle();

		const resizeObserver = new ResizeObserver(() => {
			measureTitle();
		});

		if (rootEl) {
			resizeObserver.observe(rootEl);
		}

		if (typeof document.fonts?.ready?.then === 'function') {
			void document.fonts.ready.then(() => {
				measureTitle();
			});
		}

		return () => {
			resizeObserver.disconnect();

			if (maskAnimationFrameId !== null) {
				window.cancelAnimationFrame(maskAnimationFrameId);
			}
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	{@attach useRootElement}
	class="project-title-hover"
	data-hovered={hovered ? 'true' : 'false'}
	onpointerenter={handlePointerEnter}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
>
	<h1 {@attach useTitleElement} {id} class="project-title-hover__base" aria-label={accessibleTitle}>
		{#each lines as line (line)}
			<span class="project-title-hover__line" data-project-title-line={line}>{line}</span>
		{/each}
	</h1>

	{#if hasOverlay}
		<svg
			class="project-title-hover__overlay"
			viewBox={`0 0 ${svgWidth} ${svgHeight}`}
			width={svgWidth}
			height={svgHeight}
			style:left={`${-overlayPaddingX}px`}
			style:top={`${-overlayPaddingY}px`}
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color={colorPrimary} />
					<stop offset="50%" stop-color={colorSecondary} />
					<stop offset="100%" stop-color={colorPrimary} />
				</linearGradient>

				<radialGradient
					id={revealGradientId}
					gradientUnits="userSpaceOnUse"
					cx={maskX}
					cy={maskY}
					r={maskRadius}
				>
					<stop offset="0%" stop-color="white" />
					<stop offset="42%" stop-color="white" />
					<stop offset="100%" stop-color="black" />
				</radialGradient>

				<mask id={maskId}>
					<rect
						x="0"
						y="0"
						width={svgWidth}
						height={svgHeight}
						fill={`url(#${revealGradientId})`}
					/>
				</mask>
			</defs>

			{#each lineMetrics as line (line.text)}
				<text
					class="project-title-hover__outline"
					x={line.x}
					y={line.y}
					dominant-baseline="middle"
					text-anchor="start"
					font-size={fontSizePx}
					font-family={fontFamily}
					font-weight={fontWeight}
					letter-spacing={letterSpacingPx}
					stroke-width={strokeWidthPx}
					style:opacity={1}
				>
					{line.text}
				</text>
			{/each}

			{#key hoverCycle}
				<g class="project-title-hover__trace-group" style:opacity={hovered ? 1 : 0}>
					{#each lineMetrics as line (line.text)}
						<text
							class="project-title-hover__trace"
							x={line.x}
							y={line.y}
							dominant-baseline="middle"
							text-anchor="start"
							font-size={fontSizePx}
							font-family={fontFamily}
							font-weight={fontWeight}
							letter-spacing={letterSpacingPx}
							stroke-width={strokeWidthPx}
						>
							{line.text}
						</text>
					{/each}
				</g>
			{/key}

			{#each lineMetrics as line (line.text)}
				<text
					class="project-title-hover__gradient"
					x={line.x}
					y={line.y}
					dominant-baseline="middle"
					text-anchor="start"
					font-size={fontSizePx}
					font-family={fontFamily}
					font-weight={fontWeight}
					letter-spacing={letterSpacingPx}
					stroke-width={strokeWidthPx}
					fill="none"
					stroke={`url(#${gradientId})`}
					mask={`url(#${maskId})`}
					style:opacity={hovered ? 1 : 0}
				>
					{line.text}
				</text>
			{/each}
		</svg>
	{/if}
</div>

<style>
	.project-title-hover {
		position: relative;
		display: block;
		width: max-content;
		max-width: 100%;
	}

	.project-title-hover__base {
		margin: 0;
		color: transparent;
		font-family: var(--font-display);
		font-size: clamp(9rem, 13vw, 7.25rem);
		font-weight: 700;
		line-height: 0.8;
		letter-spacing: -0.07em;
		text-transform: uppercase;
		opacity: 0;
		pointer-events: none;
		user-select: none;
	}

	.project-title-hover__line {
		display: block;
		white-space: nowrap;
	}

	.project-title-hover__overlay {
		position: absolute;
		pointer-events: none;
		overflow: visible;
	}

	.project-title-hover__outline,
	.project-title-hover__trace {
		fill: transparent;
		stroke-linejoin: round;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
		text-rendering: geometricPrecision;
	}

	.project-title-hover__gradient {
		stroke-linejoin: round;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
		text-rendering: geometricPrecision;
	}

	.project-title-hover__outline {
		stroke: hsl(var(--foreground) / 0.94);
		opacity: 1;
		transition: stroke 180ms ease;
	}

	.project-title-hover__trace-group {
		opacity: 0;
		transition: opacity 180ms ease;
	}

	.project-title-hover__trace {
		stroke: hsl(var(--foreground) / 0.48);
		stroke-dasharray: 1000;
		stroke-dashoffset: 1000;
		animation: project-title-hover-trace 1.8s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.project-title-hover__gradient {
		fill: none;
		transition: opacity 180ms ease;
	}

	@keyframes project-title-hover-trace {
		0% {
			stroke-dashoffset: 1000;
			opacity: 0;
		}

		12% {
			opacity: 1;
		}

		100% {
			stroke-dashoffset: 0;
			opacity: 1;
		}
	}

	@media (max-width: 900px) {
		.project-title-hover,
		.project-title-hover__base {
			max-width: 100%;
		}

		.project-title-hover__base {
			font-size: clamp(3.4rem, 15vw, 6rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-title-hover__outline,
		.project-title-hover__trace-group,
		.project-title-hover__gradient {
			transition: none;
		}

		.project-title-hover__trace {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
