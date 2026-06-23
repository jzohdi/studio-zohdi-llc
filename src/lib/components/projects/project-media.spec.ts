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
