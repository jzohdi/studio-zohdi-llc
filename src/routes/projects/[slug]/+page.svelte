<script lang="ts">
	import ProjectDetailPage from '$lib/components/projects/ProjectDetailPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ProjectDetailPage project={data.project} />
