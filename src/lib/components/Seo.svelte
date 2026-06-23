<script lang="ts">
	import { SITE, absoluteUrl } from '$lib/seo/site';

	interface Props {
		/** Full document title, including any branding suffix. */
		title: string;
		/** Meta description (plain text; any markup is stripped). */
		description: string;
		/** Site-relative path of the current page, used for the canonical URL. */
		path: string;
		/** Open Graph object type. `website` for the home page, `article` for case studies. */
		type?: 'website' | 'article';
		/** Social share image; defaults to the site card. Relative paths are resolved to absolute. */
		image?: string;
		/** Structured data objects rendered as `application/ld+json` scripts. */
		jsonLd?: Record<string, unknown>[];
	}

	let {
		title,
		description,
		path,
		type = 'website',
		image = SITE.ogImage,
		jsonLd = []
	}: Props = $props();

	/** Collapse whitespace and drop any stray markup so meta tags stay clean. */
	const cleanDescription = $derived(
		description
			.replace(/<[^>]*>/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	);
	const canonical = $derived(absoluteUrl(path));
	const imageUrl = $derived(absoluteUrl(image));

	/**
	 * Serialize structured data, escaping `<` so the payload can never break out
	 * of the surrounding script tag.
	 */
	const jsonLdBlocks = $derived(
		jsonLd.map((entry) => JSON.stringify(entry).replaceAll('<', '\\u003c'))
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={cleanDescription} />
	<link rel="canonical" href={canonical} />

	<!-- Open Graph -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={cleanDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={SITE.ogImageAlt} />
	<meta property="og:locale" content={SITE.locale} />

	<!-- Twitter -->
	<meta name="twitter:card" content={SITE.twitterCard} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={cleanDescription} />
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:image:alt" content={SITE.ogImageAlt} />

	{#each jsonLdBlocks as block (block)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html '<script type="application/ld+json">' + block + '</' + 'script>'}
	{/each}
</svelte:head>
