import { describe, expect, it } from 'vitest';
import {
	resolveProjectPreviewCarousel,
	resolveProjectPreviewMedia
} from '$lib/components/home/project-preview-assets';

describe('project preview assets', () => {
	it('resolves homepage video media with browser-friendly source order', () => {
		const previewMedia = resolveProjectPreviewMedia('foia-search');

		expect(previewMedia).not.toBeNull();
		expect(previewMedia?.posterUrl).toContain('/project-previews/foia-search/poster.jpg');
		expect(previewMedia?.sources.map((source) => source.type)).toEqual(['video/webm', 'video/mp4']);
	});

	it('resolves the foia-search carousel with the configured opening text and mobile poster', () => {
		const previewCarousel = resolveProjectPreviewCarousel('foia-search');

		expect(previewCarousel).not.toBeNull();
		expect(previewCarousel?.mobilePoster?.url).toContain(
			'/project-previews/foia-search/carousel/assets/mobile_1.png'
		);
		expect(previewCarousel?.scenes[0]?.text).toBe('Find Ongoing SEC Investigations');
		expect(previewCarousel?.scenes[4]?.text).toBe(
			'Receive Email Alerts When New Requests Match Your Search'
		);
	});
});
