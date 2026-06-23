<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { applyTheme, resolveTheme } from '$lib/utils/theme';

	interface Props {
		error?: App.Error;
		status?: number;
	}

	const fallbackError: App.Error = { message: 'Internal Error' };

	let { error, status }: Props = $props();

	let resolvedError = $derived(error ?? page.error ?? fallbackError);
	let resolvedStatus = $derived(status ?? page.status ?? 500);
	let isNotFound = $derived(resolvedStatus === 404);
	let headlineLines = $derived(isNotFound ? ['NOT', 'FOUND'] : ['SYSTEM', 'ERROR']);
	let pageTitle = $derived(
		isNotFound ? '404 Not Found | Studio Zohdi' : 'System Error | Studio Zohdi'
	);
	let supportingCopy = $derived.by(() => {
		if (isNotFound) {
			return "The page you requested isn't available.";
		}

		return resolvedError.message === 'Internal Error'
			? 'Something interrupted this page. Please return home and try again.'
			: resolvedError.message;
	});

	onMount(() => {
		applyTheme(resolveTheme());
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={supportingCopy} />
</svelte:head>

<main class="error-page">
	<section
		class="container error-page__content"
		aria-labelledby="error-page-title"
		aria-describedby="error-page-copy"
	>
		<h1 id="error-page-title" class="error-page__title">
			{#each headlineLines as line (line)}
				<span>{line}</span>
			{/each}
		</h1>

		<p id="error-page-copy" class="sr-only">{supportingCopy}</p>

		<a class="error-page__action eyebrow" href="/">Return Home</a>
	</section>
</main>

<style>
	.error-page {
		--error-page-background: 0 0% 100%;
		--error-page-foreground: 222.2 84% 4.9%;
		--error-page-muted-foreground: 215.4 16.3% 41%;

		--background: var(--error-page-background);
		--foreground: var(--error-page-foreground);
		--muted-foreground: var(--error-page-muted-foreground);

		position: relative;
		isolation: isolate;
		min-height: 100svh;
		overflow: clip;
		background:
			linear-gradient(180deg, hsl(var(--background)), hsl(var(--background))),
			hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.error-page::before,
	.error-page::after {
		content: '';
		position: absolute;
		inset: auto;
		pointer-events: none;
	}

	.error-page::before {
		top: -12rem;
		left: -8rem;
		width: min(44rem, 80vw);
		aspect-ratio: 1;
		background: radial-gradient(circle, hsl(var(--pink) / 0.18), transparent 68%);
		opacity: 0.95;
	}

	.error-page::after {
		right: -10rem;
		bottom: -14rem;
		width: min(40rem, 72vw);
		aspect-ratio: 1;
		background: radial-gradient(circle, hsl(var(--foreground) / 0.08), transparent 70%);
		opacity: 0.72;
	}

	:global(html[data-theme='dark']) .error-page {
		--error-page-background: 220 14% 7%;
		--error-page-foreground: 0 0% 97%;
		--error-page-muted-foreground: 220 10% 72%;
	}

	.error-page__content {
		position: relative;
		z-index: 1;
		display: grid;
		align-content: center;
		gap: clamp(1.25rem, 3vw, 2rem);
		min-height: 100svh;
		padding-block: clamp(2rem, 7vw, 4rem);
	}

	.error-page__title {
		display: grid;
		gap: 0;
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(4.8rem, 18vw, 12.5rem);
		font-weight: 800;
		line-height: 0.82;
		letter-spacing: -0.08em;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.error-page__title span:last-child {
		padding-inline-start: clamp(0.9rem, 3.5vw, 2.9rem);
	}

	.error-page__action {
		width: fit-content;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: hsl(var(--foreground) / 0.7);
		transition:
			color 180ms ease,
			transform 180ms ease;
	}

	.error-page__action::after {
		content: '→';
		font-size: 0.9em;
	}

	.error-page__action:hover {
		color: hsl(var(--foreground));
		transform: translateX(0.12rem);
	}

	@media (max-width: 900px) {
		.error-page::before {
			top: -10rem;
			left: -12rem;
			width: 34rem;
		}

		.error-page::after {
			right: -12rem;
			bottom: -10rem;
			width: 30rem;
		}

		.error-page__content {
			padding-block: clamp(1.5rem, 12vw, 3rem);
		}

		.error-page__title {
			font-size: clamp(3.8rem, 24vw, 6.8rem);
			line-height: 0.86;
		}

		.error-page__title span:last-child {
			padding-inline-start: clamp(0.55rem, 4vw, 1.25rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.error-page__action {
			transition: none;
		}

		.error-page__action:hover {
			transform: none;
		}
	}
</style>
