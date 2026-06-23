import { describe, expect, it } from 'vitest';
import { featuredProjects } from '$lib/data/featured-projects';
import {
	getProjectPage,
	getProjectPageEntries,
	projectPageSlugs,
	projectPages
} from '$lib/data/project-pages';

describe('project page data', () => {
	it('extends every featured project with detail page content', () => {
		expect(projectPages.map((project) => project.slug)).toEqual(
			featuredProjects.map((project) => project.id)
		);
	});

	it('exposes static entries for each project route', () => {
		expect(getProjectPageEntries()).toEqual(projectPageSlugs.map((slug) => ({ slug })));
	});

	it('derives website availability labels honestly', () => {
		expect(getProjectPage('foia-search')?.websiteLabel).toBe('Visit website');
		expect(getProjectPage('greffier')?.websiteLabel).toBe('Website coming soon');
		expect(getProjectPage('greffier')?.availabilityLabel).toBe('In development');
	});
});
