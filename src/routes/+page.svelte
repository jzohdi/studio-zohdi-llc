<!--
	THESIS: The page is one sentence, and the sentence is a span of time — idea → live → kept
	growing — so the layout stages it as that span. It refuses the centred-tagline-plus-two-buttons
	landing, and it refuses a reprise of /work's list.
	OWN-WORLD: The incumbent Studio Zohdi world, inherited whole: League Spartan display in
	uppercase at /work's scale, HSL neutrals carrying everything, pink only on the links.
	STORY: A visitor reads one line, laid out as the span it describes, and knows this studio
	takes products all the way and stays. Then they go to the work.
	FIRST VIEWPORT: Wordmark, rule, theme toggle across the top. The sentence mid-left as three
	stepped beats, each indented one step further than the last. The
	bottom edge carries SEE THE WORK → large, MORE ABOUT ME ↗ muted, LET'S TALK quiet at the far
	right in pink.
	FORM: Grounded structure 7 of 7, "the sentence staged as its own span"; no staging challenger
	taken; seed key 973bd2f3.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import ThemeToggle from '$lib/components/home/ThemeToggle.svelte';
	import { SITE } from '$lib/seo/site';
	import { organizationSchema, websiteSchema } from '$lib/seo/structured-data';
	import {
		applyTheme,
		persistTheme,
		resolveTheme,
		toggleTheme,
		type ThemeName
	} from '$lib/utils/theme';
	import { runAfterInitialPaint } from '$lib/utils/after-paint';

	/** The entire body copy of the page. Settled in the wayfinder map; do not extend. */
	const statement = 'I take software products from idea to live and keep them growing.';

	/**
	 * Entrance state. `pending` → `active` plays the staged entrance; `instant` is a page
	 * already at rest. A client-side arrival (e.g. back from /work) is created mid-navigation,
	 * so it starts `instant`: the page transition has already covered the change and the
	 * entrance would only replay under the reveal. A cold load starts `pending` and flips to
	 * `active` one frame after first paint.
	 */
	type IntroState = 'pending' | 'active' | 'instant';

	/** Longest the entrance waits for League Spartan before playing in whatever face is there. */
	const introFontWaitCapMs = 1200;
	/** Absolute ceiling: the page reaches rest by this point no matter what. */
	const introFallbackMs = 2600;

	let theme = $state<ThemeName>('light');
	let intro = $state<IntroState>(navigating.to ? 'instant' : 'pending');
	let cancelIntro: (() => void) | null = null;

	afterNavigate((navigation) => {
		if (navigation.type !== 'enter') {
			intro = 'instant';
			return;
		}

		// The statement is the whole screen, so it must never enter in the fallback face and
		// swap mid-entrance: wait for the display font (capped, so a slow font host can only
		// delay the entrance, never block it). Hidden tabs never fire requestAnimationFrame,
		// so a page opened in the background would sit blank until focused; the outer
		// timeout guarantees rest either way. Whichever path fires first cancels the rest.
		let cancelled = false;
		let cancelPaintWait: (() => void) | null = null;
		const activate = () => {
			if (cancelled) return;
			cancelIntro?.();
			cancelIntro = null;
			intro = 'active';
		};
		const fontsReady: Promise<unknown> =
			typeof document.fonts?.ready === 'object' ? document.fonts.ready : Promise.resolve();
		const fontWaitCap = new Promise<void>((resolve) => {
			window.setTimeout(resolve, introFontWaitCapMs);
		});
		void Promise.race([fontsReady, fontWaitCap]).then(() => {
			if (cancelled) return;
			cancelPaintWait = runAfterInitialPaint(activate);
		});
		const fallbackTimeout = window.setTimeout(activate, introFallbackMs);

		cancelIntro = () => {
			cancelled = true;
			cancelPaintWait?.();
			window.clearTimeout(fallbackTimeout);
		};
	});

	onMount(() => {
		const resolvedTheme = resolveTheme();
		theme = resolvedTheme;
		applyTheme(resolvedTheme);

		return () => {
			cancelIntro?.();
		};
	});

	function handleThemeToggle() {
		theme = toggleTheme(theme);
		applyTheme(theme);
		persistTheme(theme);
	}
</script>

<Seo
	title={SITE.defaultTitle}
	description={statement}
	path="/"
	type="website"
	jsonLd={[organizationSchema(), websiteSchema()]}
/>

<div class="landing-shell container" data-intro={intro}>
	<header class="landing-topbar" aria-label="Top bar">
		<p class="landing-topbar__brand" style:--intro-index={0}>
			<span>Studio</span>
			<span>Zohdi</span>
		</p>

		<div class="landing-topbar__rule" style:--intro-index={1} aria-hidden="true"></div>

		<div class="landing-topbar__desktop" style:--intro-index={2}>
			<ThemeToggle {theme} onToggle={handleThemeToggle} />
		</div>
		<div class="landing-topbar__mobile" style:--intro-index={2}>
			<ThemeToggle {theme} onToggle={handleThemeToggle} variant="compact" />
		</div>
	</header>

	<main class="landing-main" aria-labelledby="landing-statement">
		<h1 id="landing-statement" class="statement">
			<span class="statement__beat" style:--beat-index={0}>I take software products</span>
			<span class="statement__beat" style:--beat-index={1}>from idea to live</span>
			<span class="statement__beat" style:--beat-index={2}>and keep them growing.</span>
		</h1>
	</main>

	<nav class="landing-links" aria-label="Primary">
		<a
			class="landing-link landing-link--primary"
			href={resolve('/work')}
			data-sveltekit-preload-data
			style:--link-index={0}
		>
			See the work
			<span class="landing-link__arrow" aria-hidden="true">→</span>
		</a>

		<!-- eslint-disable svelte/no-navigation-without-resolve -- external personal site, not an internal route -->
		<a
			class="landing-link landing-link--secondary"
			href="https://jakezohdi.dev"
			target="_blank"
			rel="noreferrer noopener"
			style:--link-index={1}
		>
			More about me
			<span class="sr-only">(opens in a new tab)</span>
			<span class="landing-link__arrow" aria-hidden="true">↗</span>
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->

		<a
			class="landing-link landing-link--contact"
			href="mailto:jake@studio-zohdi-llc.com"
			style:--link-index={2}
		>
			Let's talk
		</a>
	</nav>
</div>

<style>
	.landing-shell {
		/* Display scale tracks /work's project list (5.25rem at full width) so the two
		   pages read as one voice; the floor keeps the sentence legible on phones. */
		--statement-size: clamp(2.35rem, 6.6vw, 5.25rem);
		/* One step of the staircase. Each beat of the sentence indents one more step. */
		--statement-indent: clamp(0.9rem, 6vw, 5.5rem);

		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		min-height: 100svh;
		padding-block: var(--page-padding-block) clamp(1.5rem, 4vw, 3rem);
	}

	/* ---------- Top bar ---------- */

	.landing-topbar {
		display: flex;
		align-items: center;
		gap: clamp(0.85rem, 2vw, 1.2rem);
		padding-block: 0.35rem 1.15rem;
	}

	.landing-topbar__brand {
		display: grid;
		gap: 0.18rem;
		font-family: var(--font-display);
		font-size: clamp(0.78rem, 1vw, 0.9rem);
		font-weight: 600;
		line-height: 0.92;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}

	.landing-topbar__rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, hsl(var(--foreground) / 0.16), transparent 72%);
	}

	.landing-topbar__desktop,
	.landing-topbar__mobile {
		display: flex;
		align-items: center;
	}

	.landing-topbar__mobile {
		display: none;
	}

	/* ---------- The statement ---------- */

	.landing-main {
		display: grid;
		align-content: center;
		padding-block: clamp(2rem, 6vh, 4rem);
	}

	.statement {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--statement-size);
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.statement__beat {
		display: block;
		padding-inline-start: calc(var(--beat-index) * var(--statement-indent));
	}

	/* ---------- Links ---------- */

	.landing-links {
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr);
		align-items: baseline;
		column-gap: clamp(1.5rem, 3vw, 2.75rem);
		row-gap: 1rem;
		padding-top: clamp(1.5rem, 4vh, 2.5rem);
	}

	.landing-link {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		width: fit-content;
		font-family: var(--font-display);
		text-transform: uppercase;
		white-space: nowrap;
		transition:
			color 180ms ease,
			opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 680ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 560ms ease;
		transition-delay: 0ms, var(--intro-delay), var(--intro-delay), var(--intro-delay);
	}

	.landing-link__arrow {
		display: inline-block;
		transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.landing-link--primary {
		font-size: clamp(0.95rem, 1.15vw, 1.1rem);
		font-weight: 600;
		letter-spacing: 0.2em;
		color: hsl(var(--foreground));
	}

	.landing-link--primary:hover {
		color: hsl(var(--pink));
	}

	.landing-link--primary:hover .landing-link__arrow {
		transform: translateX(0.35rem);
	}

	.landing-link--secondary {
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.28em;
		color: hsl(var(--foreground) / 0.62);
	}

	.landing-link--secondary:hover {
		color: hsl(var(--foreground));
	}

	.landing-link--secondary:hover .landing-link__arrow {
		transform: translate(0.15rem, -0.15rem);
	}

	.landing-link--contact {
		justify-self: end;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.22em;
		/* The site's contact idiom: small pink at the right edge. */
		color: var(--pink-link);
	}

	.landing-link--contact:hover {
		color: hsl(var(--foreground));
	}

	/* ---------- Entrance ----------
	   Everything is visible by default (no JS, reduced motion, client-side arrival). On a cold
	   load with JS the shell starts `pending` and flips to `active` one frame after first paint;
	   the staggered transitions below are the whole entrance. Same vocabulary as the project
	   pages: chrome drops in along the rule, display type rises out of blur, links settle last. */

	.landing-topbar__brand,
	.landing-topbar__rule,
	.landing-topbar__desktop,
	.landing-topbar__mobile {
		--intro-delay: calc(var(--intro-index, 0) * 110ms);
		transition:
			opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 820ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 720ms ease;
		transition-delay: var(--intro-delay);
	}

	.landing-topbar__rule {
		transform-origin: left center;
	}

	.statement__beat {
		--intro-delay: calc(180ms + var(--beat-index) * 150ms);
		transform-origin: 0 100%;
		transition:
			opacity 860ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 960ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 820ms ease;
		transition-delay: var(--intro-delay);
	}

	.landing-link {
		--intro-delay: calc(860ms + var(--link-index, 0) * 90ms);
	}

	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__brand,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__desktop,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__mobile {
		opacity: 0;
		filter: blur(0.3rem);
		transform: translate3d(0, -0.9rem, 0);
	}

	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__rule {
		opacity: 0;
		transform: scaleX(0.76);
	}

	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .statement__beat {
		opacity: 0;
		filter: blur(0.62rem);
		transform: translate3d(0, 2.4rem, 0) scale(0.985);
	}

	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-link {
		opacity: 0;
		filter: blur(0.28rem);
		transform: translate3d(0, 1rem, 0);
	}

	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__brand,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__rule,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__desktop,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__mobile,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .statement__beat,
	:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-link,
	:global(html[data-js='true']) .landing-shell[data-intro='active'] .landing-topbar__brand,
	:global(html[data-js='true']) .landing-shell[data-intro='active'] .landing-topbar__rule,
	:global(html[data-js='true']) .landing-shell[data-intro='active'] .landing-topbar__desktop,
	:global(html[data-js='true']) .landing-shell[data-intro='active'] .landing-topbar__mobile,
	:global(html[data-js='true']) .landing-shell[data-intro='active'] .statement__beat,
	:global(html[data-js='true']) .landing-shell[data-intro='active'] .landing-link {
		will-change: opacity, transform, filter;
	}

	/* A page that was never pending must not animate into rest. */
	.landing-shell[data-intro='instant'] .landing-topbar__brand,
	.landing-shell[data-intro='instant'] .landing-topbar__rule,
	.landing-shell[data-intro='instant'] .landing-topbar__desktop,
	.landing-shell[data-intro='instant'] .landing-topbar__mobile,
	.landing-shell[data-intro='instant'] .statement__beat {
		transition: none;
	}

	.landing-shell[data-intro='instant'] .landing-link {
		transition-duration: 180ms, 0s, 0s, 0s;
		transition-delay: 0ms;
	}

	/* ---------- Responsive ---------- */

	@media (max-width: 900px) {
		.landing-topbar__desktop {
			display: none;
		}

		.landing-topbar__mobile {
			display: flex;
		}

		.landing-links {
			grid-template-columns: 1fr;
			row-gap: 0.95rem;
		}

		.landing-link--contact {
			justify-self: start;
		}
	}

	/* Short viewports (landscape phones): trade breathing room for the no-scroll promise. */
	@media (max-height: 480px) {
		.landing-main {
			padding-block: 0.75rem;
		}

		.landing-links {
			padding-top: 0.75rem;
		}
	}

	/* ---------- Motion preferences ---------- */

	@media (prefers-reduced-motion: reduce) {
		.landing-topbar__brand,
		.landing-topbar__rule,
		.landing-topbar__desktop,
		.landing-topbar__mobile,
		.statement__beat,
		.landing-link,
		.landing-link__arrow {
			transition: none;
		}

		:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__brand,
		:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__rule,
		:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__desktop,
		:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-topbar__mobile,
		:global(html[data-js='true']) .landing-shell[data-intro='pending'] .statement__beat,
		:global(html[data-js='true']) .landing-shell[data-intro='pending'] .landing-link {
			opacity: 1;
			filter: none;
			transform: none;
		}

		.landing-link--primary:hover .landing-link__arrow,
		.landing-link--secondary:hover .landing-link__arrow {
			transform: none;
		}
	}
</style>
