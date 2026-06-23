import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the carousel source so these tests exercise getProjectMediaItems' own
// ordering/dedup logic with controlled input, independent of the generated
// preview data (which changes as carousel assets are republished).
const { resolveCarouselMock } = vi.hoisted(() => ({ resolveCarouselMock: vi.fn() }));

vi.mock('$lib/components/home/project-preview-assets', () => ({
	resolveProjectPreviewCarousel: resolveCarouselMock
}));

import { getProjectMediaItems } from './project-media';

type Scene = Record<string, unknown>;

function makeScene(overrides: Record<string, unknown> = {}): Scene {
	return {
		id: 'scene',
		label: 'Scene',
		kind: 'video',
		surface: 'desktop',
		text: null,
		fit: 'cover',
		source: { path: '/a.mp4', type: 'video/mp4', width: 16, height: 9, aspectRatio: 1.78 },
		sourceUrl: '/a.mp4',
		...overrides
	};
}

function makePoster(overrides: Record<string, unknown> = {}): Scene {
	return {
		label: 'Mobile',
		fit: 'cover',
		path: '/poster.jpg',
		type: 'image/jpeg',
		width: 9,
		height: 16,
		aspectRatio: 0.56,
		url: '/poster.jpg',
		...overrides
	};
}

function mockCarousel(scenes: Scene[], mobilePoster: Scene | null = null) {
	resolveCarouselMock.mockReturnValue({ scenes, mobilePoster });
}

beforeEach(() => {
	resolveCarouselMock.mockReset();
});

describe('getProjectMediaItems', () => {
	it('returns an empty list when the project has no published carousel', () => {
		resolveCarouselMock.mockReturnValue(null);
		expect(getProjectMediaItems('whatever')).toEqual([]);
	});

	it('uses the curated stock promotion tracker order and spans', () => {
		mockCarousel(
			[
				makeScene({ id: 'desktopScreenRecordings-0', sourceUrl: '/desktop-demo.mp4' }),
				makeScene({
					id: 'textFrames-2',
					kind: 'text',
					surface: 'text',
					mediaType: 'text',
					label: 'Text Frame 03',
					text: 'Track how tickers perform before, during, and after promotions',
					source: null,
					sourceUrl: null
				}),
				makeScene({
					id: 'mobileScreenshots-0',
					kind: 'image',
					surface: 'mobile',
					mediaType: 'screenshot',
					source: {
						path: '/mobile.png',
						type: 'image/png',
						width: 9,
						height: 16,
						aspectRatio: 0.56
					},
					sourceUrl: '/mobile.png'
				}),
				makeScene({
					id: 'desktopScreenshots-0',
					kind: 'image',
					surface: 'desktop',
					mediaType: 'screenshot',
					source: {
						path: '/desktop.png',
						type: 'image/png',
						width: 16,
						height: 10,
						aspectRatio: 1.6
					},
					sourceUrl: '/desktop.png'
				}),
				makeScene({
					id: 'mobileScreenRecordings-0',
					surface: 'mobile',
					sourceUrl: '/mobile-demo.mp4'
				})
			],
			makePoster()
		);

		expect(
			getProjectMediaItems('stock-promotion-tracker').map((item) => [item.id, item.span])
		).toEqual([
			['desktopScreenshots-0', 'full'],
			['mobileScreenshots-0', 'half'],
			['textFrames-2', 'half'],
			['desktopScreenRecordings-0', 'full']
		]);
	});

	it('builds the curated stop-nasdaq-china-fraud rows (youtube, globe, mobile recording, statement, graphic)', () => {
		mockCarousel([
			makeScene({
				id: 'mobileScreenRecordings-0',
				surface: 'mobile',
				sourceUrl: '/mobile-demo.mp4'
			})
		]);

		const items = getProjectMediaItems('stop-nasdaq-china-fraud');

		expect(items.map((item) => [item.kind, item.span])).toEqual([
			['youtube', 'full'],
			['globe', 'half'],
			['video', 'half'],
			['text', 'half'],
			['graphic', 'half']
		]);
		expect(items[0].youtube?.videoId).toBe('dJ2nr4Q-Ptk');
		expect(items[0].youtube?.startSeconds).toBe(1014);
		expect(items[1].globe?.title).toBe('API used by investors globally');
		expect(items[2].id).toBe('mobileScreenRecordings-0');
		expect(items[3].textVariant).toBe('statement');
		expect(items[3].text).toContain('DDoS mitigation');
		expect(items[4].graphic?.id).toBe('ddos');
	});

	it('builds the curated highgroundresearch rows (desktop recording, mobile screenshot, mobile recording, desktop recording)', () => {
		mockCarousel([
			makeScene({
				id: 'desktopScreenRecordings-0',
				sourceUrl: '/desktop-recording-1.mp4'
			}),
			makeScene({
				id: 'textFrames-0',
				kind: 'text',
				surface: 'text',
				mediaType: 'text',
				label: 'Text Frame 01',
				text: 'See where the sharp money is trading',
				source: null,
				sourceUrl: null
			}),
			makeScene({
				id: 'desktopScreenshots-0',
				kind: 'image',
				surface: 'desktop',
				mediaType: 'screenshot',
				source: {
					path: '/desktop.png',
					type: 'image/png',
					width: 16,
					height: 10,
					aspectRatio: 1.6
				},
				sourceUrl: '/desktop.png'
			}),
			makeScene({
				id: 'desktopScreenRecordings-1',
				sourceUrl: '/desktop-recording-2.mp4'
			}),
			makeScene({
				id: 'mobileScreenRecordings-0',
				surface: 'mobile',
				source: {
					path: '/mobile-recording.mp4',
					type: 'video/mp4',
					width: 9,
					height: 19,
					aspectRatio: 0.47
				},
				sourceUrl: '/mobile-recording.mp4'
			})
		]);

		const items = getProjectMediaItems('highgroundresearch');

		expect(items.map((item) => [item.id, item.kind, item.span])).toEqual([
			['desktopScreenRecordings-0', 'video', 'full'],
			['highgroundresearch-mobile-1', 'image', 'half'],
			['mobileScreenRecordings-0', 'video', 'half'],
			['desktopScreenRecordings-1', 'video', 'full']
		]);
		expect(items[1].surface).toBe('mobile');
		expect(items[1].source?.path).toBe('remotion/public/projects/highgroundresearch/mobile_1.png');
	});

	it('places the desktop hero scene first, ahead of earlier non-hero scenes', () => {
		const intro = makeScene({
			id: 'intro',
			kind: 'text',
			surface: 'text',
			text: 'Hi',
			source: null,
			sourceUrl: null
		});
		const hero = makeScene({ id: 'hero', surface: 'desktop', sourceUrl: '/hero.mp4' });
		mockCarousel([intro, hero]);

		expect(getProjectMediaItems('p').map((item) => item.id)).toEqual(['hero', 'intro']);
	});

	it('does not repeat the hero scene among the remaining items', () => {
		const hero = makeScene({ id: 'hero', sourceUrl: '/hero.mp4' });
		const other = makeScene({ id: 'other', sourceUrl: '/other.mp4' });
		mockCarousel([hero, other]);

		const ids = getProjectMediaItems('p').map((item) => item.id);
		expect(ids).toEqual(['hero', 'other']);
	});

	it('appends the mobile poster when its url is not already a scene source', () => {
		mockCarousel(
			[makeScene({ id: 'hero', sourceUrl: '/hero.mp4' })],
			makePoster({ url: '/poster.jpg' })
		);

		const ids = getProjectMediaItems('p').map((item) => item.id);
		expect(ids).toContain('mobile-poster');
	});

	it('skips the mobile poster when it duplicates a scene source url', () => {
		mockCarousel(
			[makeScene({ id: 'hero', sourceUrl: '/shared.jpg' })],
			makePoster({ url: '/shared.jpg' })
		);

		const ids = getProjectMediaItems('p').map((item) => item.id);
		expect(ids).not.toContain('mobile-poster');
	});
});
