<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Media rendered inside the laptop display. */
		children: Snippet;
		/** Aspect ratio (width / height) used to size the display. Defaults to the 16:10 MacBook ratio. */
		screenAspectRatio?: number;
	}

	let { children, screenAspectRatio = 16 / 10 }: Props = $props();
</script>

<div class="macbook" style:--macbook-screen-aspect={screenAspectRatio}>
	<div class="macbook__lid">
		<div class="macbook__bezel">
			<span class="macbook__camera" aria-hidden="true"></span>
			<div class="macbook__display">
				{@render children()}
			</div>
		</div>
	</div>
	<div class="macbook__base" aria-hidden="true">
		<span class="macbook__notch"></span>
	</div>
</div>

<style>
	.macbook {
		--macbook-aluminium-light: rgb(236 238 242);
		--macbook-aluminium: rgb(206 210 218);
		--macbook-aluminium-dark: rgb(166 171 182);
		--macbook-bezel: rgb(13 14 18);

		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		filter: drop-shadow(0 26px 42px rgb(15 23 42 / 0.26));
	}

	.macbook__lid {
		width: 94%;
		padding: 2px;
		border-radius: clamp(0.65rem, 1.4vw, 1.05rem);
		background: linear-gradient(
			165deg,
			var(--macbook-aluminium-light),
			var(--macbook-aluminium) 45%,
			var(--macbook-aluminium-dark)
		);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.7),
			inset 0 -1px 0 rgb(15 23 42 / 0.16);
	}

	.macbook__bezel {
		position: relative;
		padding: clamp(0.4rem, 0.95vw, 0.72rem);
		border-radius: clamp(0.55rem, 1.2vw, 0.9rem);
		background: var(--macbook-bezel);
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.04),
			inset 0 1px 2px rgb(0 0 0 / 0.6);
	}

	.macbook__camera {
		position: absolute;
		top: clamp(0.18rem, 0.42vw, 0.32rem);
		left: 50%;
		width: 0.28rem;
		height: 0.28rem;
		border-radius: 999px;
		background: radial-gradient(circle at 50% 40%, rgb(58 70 92), rgb(8 10 16));
		transform: translateX(-50%);
		box-shadow: 0 0 0 1px rgb(255 255 255 / 0.05);
	}

	.macbook__display {
		position: relative;
		aspect-ratio: var(--macbook-screen-aspect, 1.6);
		border-radius: clamp(0.28rem, 0.6vw, 0.42rem);
		overflow: hidden;
		background: linear-gradient(180deg, rgb(227 233 242), rgb(242 245 248));
	}

	.macbook__display::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			115deg,
			rgb(255 255 255 / 0.16) 0%,
			rgb(255 255 255 / 0) 26%,
			rgb(255 255 255 / 0) 74%,
			rgb(255 255 255 / 0.06) 100%
		);
		mix-blend-mode: screen;
		pointer-events: none;
	}

	.macbook__base {
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		height: clamp(0.5rem, 1.05vw, 0.8rem);
		border-radius: 0 0 clamp(0.5rem, 1vw, 0.8rem) clamp(0.5rem, 1vw, 0.8rem);
		background: linear-gradient(
			180deg,
			var(--macbook-aluminium-light),
			var(--macbook-aluminium) 38%,
			var(--macbook-aluminium-dark)
		);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.6),
			inset 0 -1px 1px rgb(15 23 42 / 0.2),
			0 12px 22px rgb(15 23 42 / 0.18);
	}

	.macbook__notch {
		width: clamp(4rem, 13%, 9rem);
		height: 42%;
		border-radius: 0 0 999px 999px;
		background: linear-gradient(180deg, var(--macbook-aluminium-dark), var(--macbook-aluminium));
		box-shadow: inset 0 -1px 1px rgb(15 23 42 / 0.18);
	}

	:global(html[data-theme='dark']) .macbook {
		--macbook-aluminium-light: rgb(116 122 134);
		--macbook-aluminium: rgb(88 94 106);
		--macbook-aluminium-dark: rgb(58 63 74);
		filter: drop-shadow(0 30px 48px rgb(0 0 0 / 0.5));
	}

	:global(html[data-theme='dark']) .macbook__lid {
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.18),
			inset 0 -1px 0 rgb(0 0 0 / 0.4);
	}
</style>
