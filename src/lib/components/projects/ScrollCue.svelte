<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/** Mirrors the page intro reveal so the cue fades in with everything else. */
		active?: boolean;
		/** Delay (ms) before the cue fades in, used to land after the intro copy. */
		introDelayMs?: number;
		/** Accessible label / scroll affordance text. */
		label?: string;
	}

	let { active = true, introDelayMs = 0, label = 'Scroll' }: Props = $props();

	// Pixels scrolled before we consider the user has "discovered" the page and
	// retire the cue, plus the overflow needed before showing it at all.
	const retireAfterPx = 64;
	const minOverflowPx = 120;

	let scrolledPastThreshold = $state(false);
	let pageCanScroll = $state(false);

	let dismissed = $derived(scrolledPastThreshold || !pageCanScroll);
	let visible = $derived(active && !dismissed);

	function measureOverflow() {
		const overflow = document.documentElement.scrollHeight - window.innerHeight;
		pageCanScroll = overflow > minOverflowPx;
	}

	function handleScroll() {
		scrolledPastThreshold = window.scrollY > retireAfterPx;
	}

	function scrollDown() {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({
			top: Math.round(window.innerHeight * 0.86),
			behavior: prefersReducedMotion ? 'auto' : 'smooth'
		});
	}

	onMount(() => {
		measureOverflow();
		handleScroll();

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', measureOverflow, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', measureOverflow);
		};
	});
</script>

<div class="scroll-cue" data-visible={visible} style:--scroll-cue-intro-delay={`${introDelayMs}ms`}>
	<button
		type="button"
		class="scroll-cue__button"
		onclick={scrollDown}
		tabindex={visible ? 0 : -1}
		aria-hidden={!visible}
		aria-label={`${label} down to view more`}
	>
		<span class="scroll-cue__label eyebrow">{label}</span>
		<span class="scroll-cue__track" aria-hidden="true">
			<span class="scroll-cue__bead"></span>
		</span>
	</button>
</div>

<style>
	.scroll-cue {
		position: fixed;
		left: 50%;
		bottom: clamp(1rem, 3.2vh, 2.1rem);
		z-index: 20;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.scroll-cue__button {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		padding: 0.35rem 0.6rem 0.2rem;
		color: hsl(var(--foreground) / 0.5);
		cursor: pointer;
		opacity: 0;
		transform: translateY(0.8rem);
		transition:
			opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 760ms cubic-bezier(0.22, 1, 0.36, 1),
			color 220ms ease;
		transition-delay: var(--scroll-cue-intro-delay, 0ms);
	}

	.scroll-cue[data-visible='true'] .scroll-cue__button {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	/* Retiring the cue should feel instant, not delayed by the intro stagger. */
	.scroll-cue[data-visible='false'] .scroll-cue__button {
		transition-delay: 0ms;
	}

	.scroll-cue__button:hover {
		color: var(--project-accent, hsl(var(--foreground) / 0.8));
	}

	.scroll-cue__label {
		font-size: 0.62rem;
		letter-spacing: 0.34em;
		/* Optical centering against the 0.34em trailing letter-spacing. */
		text-indent: 0.34em;
		opacity: 0.92;
		transition: opacity 220ms ease;
	}

	.scroll-cue__track {
		position: relative;
		display: block;
		width: 1px;
		height: 2.45rem;
		overflow: hidden;
		background: linear-gradient(
			180deg,
			transparent,
			hsl(var(--foreground) / 0.28) 22%,
			hsl(var(--foreground) / 0.28) 78%,
			transparent
		);
	}

	.scroll-cue__bead {
		position: absolute;
		left: 50%;
		top: 0;
		width: 3px;
		height: 3px;
		border-radius: 999px;
		background: var(--project-accent, hsl(var(--foreground)));
		box-shadow: 0 0 8px 1px var(--project-accent, hsl(var(--foreground) / 0.6));
		transform: translate(-50%, -120%);
		animation: scroll-cue-bead 2200ms cubic-bezier(0.65, 0, 0.35, 1) infinite;
	}

	.scroll-cue__button:hover .scroll-cue__bead {
		animation-duration: 1500ms;
	}

	@keyframes scroll-cue-bead {
		0% {
			transform: translate(-50%, -120%);
			opacity: 0;
		}
		18% {
			opacity: 1;
		}
		82% {
			opacity: 1;
		}
		100% {
			transform: translate(-50%, 2.45rem);
			opacity: 0;
		}
	}

	@media (max-width: 900px) {
		.scroll-cue__track {
			height: 2rem;
		}

		.scroll-cue__label {
			font-size: 0.58rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-cue__button {
			transition: opacity 200ms ease;
			transform: none;
		}

		.scroll-cue[data-visible='true'] .scroll-cue__button {
			transform: none;
		}

		.scroll-cue__bead {
			animation: none;
			/* Rest at the bottom of the track as a static down indicator. */
			transform: translate(-50%, 1.9rem);
			opacity: 0.9;
		}
	}
</style>
