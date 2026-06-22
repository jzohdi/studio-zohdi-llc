import { describe, expect, it } from 'vitest';
import { formatSceneCounter } from './preview-carousel';

describe('formatSceneCounter', () => {
	it('renders a 1-based, zero-padded "current / total"', () => {
		expect(formatSceneCounter(0, 7)).toBe('01 / 07');
	});

	it('pads both sides to two digits', () => {
		expect(formatSceneCounter(4, 9)).toBe('05 / 09');
	});

	it('does not truncate counts of ten or more', () => {
		expect(formatSceneCounter(9, 12)).toBe('10 / 12');
	});

	it('handles a single-scene carousel', () => {
		expect(formatSceneCounter(0, 1)).toBe('01 / 01');
	});
});
