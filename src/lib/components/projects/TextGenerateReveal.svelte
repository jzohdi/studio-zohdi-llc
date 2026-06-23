<script lang="ts">
	import { buildRevealChunks } from '$lib/components/projects/text-generate-reveal';

	interface Props {
		text: string;
		active?: boolean;
		startDelayMs?: number;
		wordStaggerMs?: number;
		wordDurationMs?: number;
		filter?: boolean;
	}

	let {
		text,
		active = true,
		startDelayMs = 0,
		wordStaggerMs = 36,
		wordDurationMs = 580,
		filter = true
	}: Props = $props();

	let state = $derived<'pending' | 'active'>(active ? 'active' : 'pending');
	let chunks = $derived(buildRevealChunks(text));
</script>

<span
	class="text-generate-reveal"
	data-filtered={filter ? 'true' : 'false'}
	data-state={state}
	style:--text-generate-start-delay={`${startDelayMs}ms`}
	style:--text-generate-word-stagger={`${wordStaggerMs}ms`}
	style:--text-generate-word-duration={`${wordDurationMs}ms`}
>
	{#each chunks as chunk, chunkIndex (chunkIndex)}
		{#if chunk.kind === 'link'}
			<a class="text-generate-reveal__link" {...chunk.attributes}>
				{#each chunk.segments as segment, segmentIndex (segmentIndex)}
					{#if segment.strong}
						<strong>
							{#each segment.pieces as piece, pieceIndex (pieceIndex)}
								{#if piece.kind === 'word'}
									<span
										class="text-generate-reveal__word"
										style:--text-generate-word-index={piece.wordIndex}
									>
										{piece.text}
									</span>
								{:else}
									{piece.text}
								{/if}
							{/each}
						</strong>
					{:else}
						{#each segment.pieces as piece, pieceIndex (pieceIndex)}
							{#if piece.kind === 'word'}
								<span
									class="text-generate-reveal__word"
									style:--text-generate-word-index={piece.wordIndex}
								>
									{piece.text}
								</span>
							{:else}
								{piece.text}
							{/if}
						{/each}
					{/if}
				{/each}
			</a>
		{:else}
			<span>
				{#each chunk.segments as segment, segmentIndex (segmentIndex)}
					{#if segment.strong}
						<strong>
							{#each segment.pieces as piece, pieceIndex (pieceIndex)}
								{#if piece.kind === 'word'}
									<span
										class="text-generate-reveal__word"
										style:--text-generate-word-index={piece.wordIndex}
									>
										{piece.text}
									</span>
								{:else}
									{piece.text}
								{/if}
							{/each}
						</strong>
					{:else}
						{#each segment.pieces as piece, pieceIndex (pieceIndex)}
							{#if piece.kind === 'word'}
								<span
									class="text-generate-reveal__word"
									style:--text-generate-word-index={piece.wordIndex}
								>
									{piece.text}
								</span>
							{:else}
								{piece.text}
							{/if}
						{/each}
					{/if}
				{/each}
			</span>
		{/if}
	{/each}
</span>

<style>
	.text-generate-reveal {
		--text-generate-initial-blur: 0.28rem;
		--text-generate-initial-opacity: 0;
		--text-generate-initial-offset: -0.24em;
	}

	.text-generate-reveal[data-filtered='false'] {
		--text-generate-initial-blur: 0rem;
	}

	.text-generate-reveal__word {
		display: inline-block;
		will-change: opacity, filter, transform;
	}

	.text-generate-reveal__link,
	.text-generate-reveal__link > span {
		color: blue;
		border-radius: 0.18rem;
		text-decoration-line: underline;
		text-decoration-style: solid;
		text-decoration-color: currentColor;
		text-decoration-skip-ink: auto;
		text-decoration-thickness: 0.095em;
		text-underline-offset: 0.16em;
		transition:
			color 180ms ease,
			text-decoration-color 180ms ease,
			text-decoration-thickness 180ms ease,
			text-underline-offset 180ms ease;
	}

	.text-generate-reveal__link:hover,
	.text-generate-reveal__link:hover > span {
		color: var(--project-accent, hsl(var(--foreground)));
		text-decoration-color: var(--project-accent, currentColor);
		text-decoration-thickness: 0.12em;
		text-underline-offset: 0.22em;
	}

	.text-generate-reveal__link:focus-visible,
	.text-generate-reveal__link:focus-visible > span {
		outline: 2px solid hsl(var(--pink));
		outline-offset: 4px;
		color: var(--project-accent, hsl(var(--foreground)));
		text-decoration-color: var(--project-accent, currentColor);
		text-decoration-thickness: 0.12em;
		text-underline-offset: 0.22em;
	}

	:global(html[data-js='true'])
		.text-generate-reveal[data-state='pending']
		.text-generate-reveal__word,
	:global(html[data-js='true'])
		.text-generate-reveal[data-state='active']
		.text-generate-reveal__word {
		opacity: var(--text-generate-initial-opacity);
		filter: blur(var(--text-generate-initial-blur));
		transform: translate3d(var(--text-generate-initial-offset), 0, 0);
	}

	:global(html[data-js='true'])
		.text-generate-reveal[data-state='active']
		.text-generate-reveal__word {
		animation: text-generate-reveal-word var(--text-generate-word-duration)
			cubic-bezier(0.19, 1, 0.22, 1) both;
		animation-delay: calc(
			var(--text-generate-start-delay) +
				(var(--text-generate-word-index) * var(--text-generate-word-stagger))
		);
	}

	@keyframes text-generate-reveal-word {
		0% {
			opacity: var(--text-generate-initial-opacity);
			filter: blur(var(--text-generate-initial-blur));
			transform: translate3d(var(--text-generate-initial-offset), 0, 0);
		}

		20% {
			opacity: 0;
			filter: blur(var(--text-generate-initial-blur));
			transform: translate3d(var(--text-generate-initial-offset), 0, 0);
		}

		46% {
			opacity: 0.92;
			filter: blur(calc(var(--text-generate-initial-blur) * 0.28));
			transform: translate3d(calc(var(--text-generate-initial-offset) * 0.32), 0, 0);
		}

		62% {
			opacity: 1;
			filter: blur(calc(var(--text-generate-initial-blur) * 0.08));
			transform: translate3d(calc(var(--text-generate-initial-offset) * 0.12), 0, 0);
		}

		100% {
			opacity: 1;
			filter: blur(0);
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html[data-js='true']) .text-generate-reveal .text-generate-reveal__word {
			animation: none !important;
			opacity: 1 !important;
			filter: none !important;
			transform: none !important;
		}
	}
</style>
