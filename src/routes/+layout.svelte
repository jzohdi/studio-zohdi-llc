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
</svelte:head>

{@render children()}
