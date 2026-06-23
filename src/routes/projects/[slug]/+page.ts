import { error } from '@sveltejs/kit';
import { getProjectPage, getProjectPageEntries } from '$lib/data/project-pages';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => getProjectPageEntries();

export const load: PageLoad = ({ params }) => {
	const project = getProjectPage(params.slug);

	if (!project) {
		error(404, 'Project not found');
	}

	return {
		project
	};
};
