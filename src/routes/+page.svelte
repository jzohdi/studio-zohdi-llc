<script lang="ts">
	import { onMount } from 'svelte';
	import BrandBlock from '$lib/components/home/BrandBlock.svelte';
	import DesktopShowcase from '$lib/components/home/DesktopShowcase.svelte';
	import MobileShowcase from '$lib/components/home/MobileShowcase.svelte';
	import Topbar from '$lib/components/home/Topbar.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { SITE } from '$lib/seo/site';
	import { organizationSchema, websiteSchema } from '$lib/seo/structured-data';
	import { featuredProjects } from '$lib/data/featured-projects';
	import {
		applyTheme,
		persistTheme,
		resolveTheme,
		toggleTheme,
		type ThemeName
	} from '$lib/utils/theme';

	let theme = $state<ThemeName>('light');

	onMount(() => {
		const resolvedTheme = resolveTheme();
		theme = resolvedTheme;
		applyTheme(resolvedTheme);
	});

	function handleThemeToggle() {
		theme = toggleTheme(theme);
		applyTheme(theme);
		persistTheme(theme);
	}
</script>

<Seo
	title={SITE.defaultTitle}
	description={SITE.description}
	path="/"
	type="website"
	jsonLd={[organizationSchema(), websiteSchema()]}
/>

<div class="home-shell">
	<Topbar {theme} onToggle={handleThemeToggle} />

	<main class="container home-main">
		<section class="home-hero" aria-labelledby="homepage-title">
			<BrandBlock projectCount={featuredProjects.length} />

			<DesktopShowcase />

			<MobileShowcase />
		</section>
	</main>
</div>

<style>
	.home-shell {
		min-height: 100svh;
		position: relative;
		padding-block: var(--page-padding-block) clamp(1.75rem, 4vw, 3rem);
	}

	.home-main {
		padding-bottom: clamp(1.5rem, 4vw, 3.25rem);
	}

	.home-hero {
		display: grid;
		gap: clamp(1.25rem, 3vw, 2rem);
	}
</style>
