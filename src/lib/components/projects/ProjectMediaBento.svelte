<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { ProjectPage } from '$lib/data/project-pages';
	import ProjectMediaTile from '$lib/components/projects/ProjectMediaTile.svelte';
	import {
		getProjectMediaItems,
		type ProjectMediaItem
	} from '$lib/components/projects/project-media';

	interface Props {
		project: ProjectPage;
		revealReady?: boolean;
	}

	const revealedItemIds = new SvelteSet<string>();
	const revealDelayStepMs = 90;
	const revealThreshold = 0.14;
	const revealRootMargin = '0px 0px -12% 0px';

	let { project, revealReady = true }: Props = $props();

	let mediaItems = $derived(getProjectMediaItems(project.id));

	function getTileClass(item: ProjectMediaItem, index: number) {
		const classNames = ['project-media-bento__cell'];

		if (index === 0) {
			classNames.push('is-hero');
		} else if (item.kind === 'text') {
			classNames.push('is-text');
		} else if (item.surface === 'mobile') {
			classNames.push('is-mobile');
		} else {
			classNames.push('is-wide');
		}

		return classNames.join(' ');
	}

	function observeReveal(itemId: string) {
		return (element: HTMLDivElement) => {
			if (revealedItemIds.has(itemId) || typeof IntersectionObserver === 'undefined') {
				revealedItemIds.add(itemId);
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) {
						return;
					}

					revealedItemIds.add(itemId);
				},
				{
					threshold: revealThreshold,
					rootMargin: revealRootMargin
				}
			);

			observer.observe(element);

			return () => {
				observer.disconnect();
			};
		};
	}
</script>

{#if mediaItems.length > 0}
	<section class="project-media-bento" aria-labelledby="project-media-heading">
		<h2 id="project-media-heading" class="sr-only">{project.name} product media</h2>

		<div class="project-media-bento__grid">
			{#each mediaItems as item, index (item.id)}
				{@const revealed = revealedItemIds.has(item.id)}
				<div
					class={getTileClass(item, index)}
					style:--project-media-reveal-delay={`${Math.min(index, 5) * revealDelayStepMs}ms`}
					{@attach revealReady && observeReveal(item.id)}
				>
					<ProjectMediaTile {item} accent={project.accent} isHero={index === 0} {revealed} />
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.project-media-bento {
		display: grid;
		gap: clamp(1.35rem, 2vw, 1.75rem);
		margin-top: clamp(3.5rem, 8vw, 7rem);
	}

	.project-media-bento__grid {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: clamp(1rem, 1.8vw, 1.35rem);
		align-items: stretch;
	}

	.project-media-bento__cell {
		grid-column: span 6;
	}

	.project-media-bento__cell.is-hero {
		grid-column: 1 / -1;
	}

	.project-media-bento__cell.is-wide {
		grid-column: span 7;
	}

	.project-media-bento__cell.is-mobile,
	.project-media-bento__cell.is-text {
		grid-column: span 5;
	}

	@media (max-width: 1024px) {
		.project-media-bento__grid {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		.project-media-bento__cell,
		.project-media-bento__cell.is-wide,
		.project-media-bento__cell.is-mobile,
		.project-media-bento__cell.is-text {
			grid-column: span 3;
		}

		.project-media-bento__cell.is-hero {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 720px) {
		.project-media-bento__grid {
			grid-template-columns: 1fr;
		}

		.project-media-bento__cell,
		.project-media-bento__cell.is-wide,
		.project-media-bento__cell.is-mobile,
		.project-media-bento__cell.is-text,
		.project-media-bento__cell.is-hero {
			grid-column: 1 / -1;
		}
	}
</style>
