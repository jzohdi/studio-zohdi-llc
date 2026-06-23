<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Media rendered inside the phone screen. */
		children: Snippet;
		/** Aspect ratio (width / height) used to size the screen. Defaults to the modern iPhone ratio. */
		screenAspectRatio?: number;
	}

	let { children, screenAspectRatio = 9 / 19.5 }: Props = $props();
</script>

<div class="phone" style:--phone-screen-aspect={screenAspectRatio}>
	<span class="phone__btn phone__btn--mute" aria-hidden="true"></span>
	<span class="phone__btn phone__btn--volume-up" aria-hidden="true"></span>
	<span class="phone__btn phone__btn--volume-down" aria-hidden="true"></span>
	<span class="phone__btn phone__btn--power" aria-hidden="true"></span>

	<div class="phone__frame">
		<div class="phone__screen">
			<span class="phone__island" aria-hidden="true"></span>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.phone {
		--phone-titanium-light: rgb(218 221 228);
		--phone-titanium: rgb(176 181 192);
		--phone-titanium-dark: rgb(118 124 136);
		--phone-radius: clamp(1.6rem, 8%, 2.6rem);

		position: relative;
		width: 100%;
		filter: drop-shadow(0 24px 40px rgb(15 23 42 / 0.3));
	}

	.phone__frame {
		position: relative;
		padding: clamp(0.34rem, 1.6%, 0.52rem);
		border-radius: var(--phone-radius);
		background: linear-gradient(
			150deg,
			var(--phone-titanium-light),
			var(--phone-titanium) 42%,
			var(--phone-titanium-dark)
		);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.6),
			inset 0 0 0 1px rgb(15 23 42 / 0.12),
			inset 0 -1px 2px rgb(15 23 42 / 0.22);
	}

	.phone__screen {
		position: relative;
		aspect-ratio: var(--phone-screen-aspect, 0.4615);
		border-radius: calc(var(--phone-radius) - clamp(0.28rem, 1.2%, 0.42rem));
		overflow: hidden;
		background: linear-gradient(180deg, rgb(18 21 28), rgb(8 10 14));
		box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.55);
	}

	.phone__island {
		position: absolute;
		top: clamp(0.42rem, 3%, 0.85rem);
		left: 50%;
		z-index: 2;
		width: clamp(2.6rem, 32%, 4.4rem);
		height: clamp(0.62rem, 8%, 1.05rem);
		border-radius: 999px;
		background: rgb(6 7 10);
		transform: translateX(-50%);
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.05);
	}

	.phone__btn {
		position: absolute;
		z-index: 1;
		border-radius: 999px;
		background: linear-gradient(180deg, var(--phone-titanium), var(--phone-titanium-dark));
	}

	.phone__btn--mute,
	.phone__btn--volume-up,
	.phone__btn--volume-down {
		left: -0.12rem;
		width: 0.16rem;
	}

	.phone__btn--mute {
		top: 17%;
		height: 4%;
	}

	.phone__btn--volume-up {
		top: 26%;
		height: 7%;
	}

	.phone__btn--volume-down {
		top: 36%;
		height: 7%;
	}

	.phone__btn--power {
		right: -0.12rem;
		top: 28%;
		width: 0.16rem;
		height: 10%;
	}

	:global(html[data-theme='dark']) .phone {
		--phone-titanium-light: rgb(120 126 138);
		--phone-titanium: rgb(86 92 104);
		--phone-titanium-dark: rgb(52 57 68);
		filter: drop-shadow(0 28px 46px rgb(0 0 0 / 0.55));
	}
</style>
