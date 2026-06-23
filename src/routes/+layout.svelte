<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import PageTransition from '$lib/components/PageTransition.svelte';
	import { pageTransition } from '$lib/utils/page-transition.svelte';

	let { children }: { children: Snippet } = $props();

	onNavigate((navigation) => {
		const from = navigation.from?.url.pathname;
		const to = navigation.to?.url.pathname;

		// Only cover real same-app route changes (skip hash-only / same-page nav).
		if (!to || from === to) {
			return;
		}

		const playReveal = pageTransition.cover(to);
		if (!playReveal) {
			return;
		}

		// Hold the navigation until the viewport is fully covered, then reveal the
		// new page once SvelteKit has swapped the DOM.
		return playReveal.then((reveal) => reveal);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
	<link rel="manifest" href="/favicon_io/site.webmanifest" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800&display=swap"
	/>
	<meta name="theme-color" content="#f8f8fb" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#090d14" media="(prefers-color-scheme: dark)" />
	<script>
		document.documentElement.dataset.js = 'true';

		try {
			const storageKey = 'studio-zohdi-theme';
			const storedTheme = window.localStorage.getItem(storageKey);
			const resolvedTheme =
				storedTheme === 'light' || storedTheme === 'dark'
					? storedTheme
					: window.matchMedia('(prefers-color-scheme: dark)').matches
						? 'dark'
						: 'light';

			document.documentElement.dataset.theme = resolvedTheme;
			document.documentElement.style.colorScheme = resolvedTheme;
		} catch {
			// Keep the CSS default theme if storage or media queries are unavailable.
		}
	</script>
</svelte:head>

{@render children()}

<PageTransition />
