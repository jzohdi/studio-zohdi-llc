<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
