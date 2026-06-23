<script lang="ts">
	import ProjectMobilePreview from '$lib/components/home/ProjectMobilePreview.svelte';
	import { featuredProjects } from '$lib/data/featured-projects';
</script>

<section class="mobile-showcase" aria-labelledby="mobile-projects-heading">
	<h2 id="mobile-projects-heading" class="sr-only">Recent projects</h2>

	<ul class="mobile-showcase__list">
		{#each featuredProjects as project (project.id)}
			<li>
				<a
					class="project-row"
					href={`/projects/${project.id}`}
					data-sveltekit-preload-data
					aria-label={`View the ${project.name} project`}
				>
					<div class="project-row__copy">
						<h2>{project.name}</h2>
						<p>{project.summary}</p>
					</div>

					<div class="project-row__visual">
						<ProjectMobilePreview {project} />
					</div>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.mobile-showcase {
		display: none;
	}

	.mobile-showcase__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.mobile-showcase__list {
		display: grid;
		gap: 0;
	}

	.mobile-showcase__list li + li {
		border-top: 1px solid hsl(var(--foreground) / 0.08);
	}

	.project-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.95rem;
		align-items: center;
		padding: 1rem 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		backdrop-filter: none;
		box-shadow: none;
	}

	.project-row__copy {
		padding-left: 0;
	}

	.project-row__copy h2 {
		font-size: clamp(1.25rem, 6vw, 1.9rem);
		font-weight: 700;
		line-height: 0.94;
		letter-spacing: -0.04em;
	}

	.project-row__copy p {
		margin-top: 0.45rem;
		max-width: 14rem;
		color: hsl(var(--foreground) / 0.58);
		font-size: 0.88rem;
		line-height: 1.45;
	}

	.project-row__visual {
		width: min(38vw, 9.9rem);
	}

	@media (max-width: 900px) {
		.mobile-showcase {
			display: block;
		}
	}

	@media (max-width: 560px) {
		.project-row {
			grid-template-columns: minmax(0, 1fr) minmax(8.25rem, 36vw);
			padding: 0.9rem 0;
		}

		.project-row__visual {
			width: 100%;
		}
	}
</style>
