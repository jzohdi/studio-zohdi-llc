<script lang="ts">
	interface Props {
		/** Number of featured projects, shown as a zero-padded count. */
		projectCount: number;
	}

	let { projectCount }: Props = $props();
</script>

<div class="brand-block">
	<h1 id="homepage-title" class="brand-block__title">
		<span>STUDIO</span>
		<span>ZOHDI</span>
	</h1>
	<p class="brand-block__count eyebrow">
		RECENT PROJECTS ({projectCount.toString().padStart(2, '0')})
	</p>
</div>

<style>
	.brand-block {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 0.7rem 1.35rem;
		padding-top: 0.2rem;
	}

	.brand-block__title {
		display: grid;
		gap: 0.18rem;
		font-size: clamp(0.78rem, 1vw, 0.9rem);
		font-weight: 600;
		line-height: 0.92;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}

	.brand-block__count {
		font-family: var(--font-display);
		font-size: clamp(0.72rem, 1vw, 0.82rem);
		font-weight: 500;
		letter-spacing: 0.22em;
		color: hsl(var(--muted-foreground));
		text-transform: uppercase;
	}
</style>
