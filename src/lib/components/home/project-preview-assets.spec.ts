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
		expect(previewCarousel?.scenes[2]?.text).toBe(
			'Receive Email Alerts When New Requests Match Your Search'
		);
		expect(previewCarousel?.scenes[4]?.text).toBe('Lightning Fast Search API');
	});

	it('resolves the stock-promotion-tracker carousel with desktop mobile poster support', () => {
		const previewCarousel = resolveProjectPreviewCarousel('stock-promotion-tracker');

		expect(previewCarousel).not.toBeNull();
		expect(previewCarousel?.mobilePoster?.url).toContain(
			'/project-previews/stock-promotion-tracker/carousel/assets/desktop_1.png'
		);
		expect(previewCarousel?.scenes.map((scene) => scene.text)).toEqual([
			null,
			'Hourly updates on stock promotions from hundreds of sources',
			null,
			'Performance analysis',
			null,
			'Track how tickers perform before, during, and after promotions',
			null
		]);
		expect(previewCarousel?.scenes.map((scene) => scene.mediaType)).toEqual([
			'screenshot',
			'text',
			'recording',
			'text',
			'screenshot',
			'text',
			'recording'
		]);
	});

	it('resolves the stop-nasdaq-china-fraud carousel in the configured media order', () => {
		const previewCarousel = resolveProjectPreviewCarousel('stop-nasdaq-china-fraud');

		expect(previewCarousel).not.toBeNull();
		expect(previewCarousel?.mobilePoster?.url).toContain(
			'/project-previews/stop-nasdaq-china-fraud/carousel/assets/desktop_1_sec.png'
		);
		expect(previewCarousel?.scenes.map((scene) => scene.text)).toEqual([
			null,
			'Referenced by the SEC During Investigation of Fraudulent IPOs',
			null,
			'API Used by Hedge Funds and Retail Investors',
			null
		]);
		expect(previewCarousel?.scenes.map((scene) => scene.mediaType)).toEqual([
			'recording',
			'text',
			'screenshot',
			'text',
			'recording'
		]);
	});

	it('resolves the highgroundresearch carousel without using the mobile preview image as a scene', () => {
		const previewCarousel = resolveProjectPreviewCarousel('highgroundresearch');

		expect(previewCarousel).not.toBeNull();
		expect(previewCarousel?.mobilePoster?.url).toContain(
			'/project-previews/highgroundresearch/carousel/assets/mobilePreview.png'
		);
		expect(previewCarousel?.scenes.map((scene) => scene.text)).toEqual([
			null,
			'See where the sharp money is trading',
			null,
			'Live feed of top trader activity',
			null,
			'Market alerts based on powerful configurations',
			null
		]);
		expect(previewCarousel?.scenes.map((scene) => scene.mediaType)).toEqual([
			'recording',
			'text',
			'screenshot',
			'text',
			'recording',
			'text',
			'recording'
		]);
		expect(
			previewCarousel?.scenes.some((scene) => scene.sourceUrl?.includes('/mobilePreview.png'))
		).toBe(false);
	});

	it('resolves the greffier carousel and uses the desktop screenshot as the mobile poster', () => {
		const previewCarousel = resolveProjectPreviewCarousel('greffier');

		expect(previewCarousel).not.toBeNull();
		expect(previewCarousel?.mobilePoster?.url).toContain(
			'/project-previews/greffier/carousel/assets/desktop_1.png'
		);
		expect(previewCarousel?.scenes.map((scene) => scene.text)).toEqual([null, 'Coming Soon']);
		expect(previewCarousel?.scenes.map((scene) => scene.mediaType)).toEqual(['screenshot', 'text']);
	});

	it('resolves the 8ksearch carousel while keeping the mobile preview image out of the scene list', () => {
		const previewCarousel = resolveProjectPreviewCarousel('8ksearch');

		expect(previewCarousel).not.toBeNull();
		expect(previewCarousel?.mobilePoster?.url).toContain(
			'/project-previews/8ksearch/carousel/assets/mobilePreview.png'
		);
		expect(previewCarousel?.scenes.map((scene) => scene.text)).toEqual([
			"Find the SEC filings that companies don't want you to see",
			null,
			'Build advanced queries for noteworthy results',
			null
		]);
		expect(previewCarousel?.scenes.map((scene) => scene.mediaType)).toEqual([
			'text',
			'recording',
			'text',
			'recording'
		]);
		expect(
			previewCarousel?.scenes.some((scene) => scene.sourceUrl?.includes('/mobilePreview.png'))
		).toBe(false);
	});
});
