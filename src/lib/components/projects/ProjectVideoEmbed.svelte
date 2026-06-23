<script lang="ts">
	interface Props {
		videoId: string;
		startSeconds?: number | null;
		caption?: string | null;
		title?: string;
	}

	let { videoId, startSeconds = null, caption = null, title = 'Embedded video' }: Props = $props();

	let activated = $state(false);
	let thumbnailFailed = $state(false);

	let thumbnailUrl = $derived(
		thumbnailFailed
			? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
			: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
	);

	let embedUrl = $derived.by(() => {
		const startParam = startSeconds && startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : '';

		return (
			`https://www.youtube-nocookie.com/embed/${videoId}` +
			`?autoplay=1&rel=0&modestbranding=1&playsinline=1${startParam}`
		);
	});

	let playLabel = $derived(caption ? `Play video: ${caption}` : 'Play video');
</script>

<figure class="video-embed">
	<div class="video-embed__frame">
		{#if activated}
			<iframe
				class="video-embed__iframe"
				src={embedUrl}
				{title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		{:else}
			<button
				class="video-embed__play"
				type="button"
				onclick={() => (activated = true)}
				aria-label={playLabel}
			>
				<img
					class="video-embed__thumb"
					src={thumbnailUrl}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					onerror={() => (thumbnailFailed = true)}
				/>
				<span class="video-embed__scrim" aria-hidden="true"></span>
				<span class="video-embed__icon" aria-hidden="true">
					<svg viewBox="0 0 68 48" focusable="false" aria-hidden="true">
						<path
							class="video-embed__icon-shell"
							d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
						/>
						<path d="M45 24 27 14v20z" fill="#fff" />
					</svg>
				</span>
			</button>
		{/if}
	</div>

	{#if caption}
		<figcaption class="video-embed__caption">{caption}</figcaption>
	{/if}
</figure>

<style>
	.video-embed {
		display: grid;
		gap: clamp(0.85rem, 1.6vw, 1.1rem);
		margin: 0;
	}

	.video-embed__frame {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: clamp(0.9rem, 1.4vw, 1.25rem);
		background: rgb(8 10 18);
		box-shadow:
			0 12px 30px rgb(18 27 45 / 0.16),
			0 26px 56px rgb(18 27 45 / 0.12);
	}

	.video-embed__iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}

	.video-embed__play {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		cursor: pointer;
		background: none;
		appearance: none;
	}

	.video-embed__thumb {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.video-embed__scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgb(8 10 18 / 0.08), rgb(8 10 18 / 0.42));
		transition: opacity 320ms ease;
	}

	.video-embed__icon {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.video-embed__icon svg {
		width: clamp(4.5rem, 7vw, 6rem);
		height: auto;
		filter: drop-shadow(0 6px 18px rgb(0 0 0 / 0.35));
		transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.video-embed__icon-shell {
		fill: rgb(20 20 24 / 0.82);
		transition: fill 240ms ease;
	}

	.video-embed__play:hover .video-embed__thumb {
		transform: scale(1.03);
	}

	.video-embed__play:hover .video-embed__icon svg,
	.video-embed__play:focus-visible .video-embed__icon svg {
		transform: scale(1.08);
	}

	.video-embed__play:hover .video-embed__icon-shell,
	.video-embed__play:focus-visible .video-embed__icon-shell {
		fill: rgb(229 9 20 / 0.95);
	}

	.video-embed__play:focus-visible {
		outline: 3px solid var(--project-accent, rgb(125 79 255));
		outline-offset: 3px;
	}

	.video-embed__caption {
		color: hsl(var(--foreground) / 0.62);
		font-size: clamp(0.9rem, 1.4vw, 1.02rem);
		line-height: 1.45;
		letter-spacing: -0.01em;
		text-wrap: pretty;
	}

	@media (prefers-reduced-motion: reduce) {
		.video-embed__thumb,
		.video-embed__icon svg {
			transition: none;
		}
	}
</style>
