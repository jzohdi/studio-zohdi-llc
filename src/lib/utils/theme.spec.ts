import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	THEME_STORAGE_KEY,
	applyTheme,
	getSystemTheme,
	persistTheme,
	readStoredTheme,
	resolveTheme,
	toggleTheme
} from './theme';

/**
 * Stub `window` with a configurable `matchMedia` result and an in-memory
 * `localStorage`, mirroring the only browser APIs `theme.ts` touches.
 */
function stubWindow(options: { prefersDark?: boolean; storedValue?: string | null } = {}) {
	const store = new Map<string, string>();
	if (options.storedValue != null) {
		store.set(THEME_STORAGE_KEY, options.storedValue);
	}

	const localStorage = {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, value)
	};

	vi.stubGlobal('window', {
		matchMedia: () => ({ matches: options.prefersDark ?? false }),
		localStorage
	});

	return { store, localStorage };
}

/** Stub `document` with just the element fields `applyTheme` writes to. */
function stubDocument() {
	const documentElement = { dataset: {} as Record<string, string>, style: { colorScheme: '' } };
	vi.stubGlobal('document', { documentElement });
	return documentElement;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('toggleTheme', () => {
	it('switches dark to light', () => {
		expect(toggleTheme('dark')).toBe('light');
	});

	it('switches light to dark', () => {
		expect(toggleTheme('light')).toBe('dark');
	});
});

describe('getSystemTheme', () => {
	it('returns light when there is no window (SSR)', () => {
		expect(getSystemTheme()).toBe('light');
	});

	it('returns dark when the system prefers a dark color scheme', () => {
		stubWindow({ prefersDark: true });
		expect(getSystemTheme()).toBe('dark');
	});

	it('returns light when the system prefers a light color scheme', () => {
		stubWindow({ prefersDark: false });
		expect(getSystemTheme()).toBe('light');
	});
});

describe('readStoredTheme', () => {
	it('returns null when there is no window (SSR)', () => {
		expect(readStoredTheme()).toBeNull();
	});

	it('returns the stored theme when it is a valid value', () => {
		stubWindow({ storedValue: 'dark' });
		expect(readStoredTheme()).toBe('dark');
	});

	it('returns null when the stored value is not a known theme', () => {
		stubWindow({ storedValue: 'sepia' });
		expect(readStoredTheme()).toBeNull();
	});

	it('returns null when nothing is stored', () => {
		stubWindow();
		expect(readStoredTheme()).toBeNull();
	});
});

describe('resolveTheme', () => {
	it('prefers the stored theme over the system preference', () => {
		stubWindow({ storedValue: 'light', prefersDark: true });
		expect(resolveTheme()).toBe('light');
	});

	it('falls back to the system preference when nothing is stored', () => {
		stubWindow({ prefersDark: true });
		expect(resolveTheme()).toBe('dark');
	});
});

describe('persistTheme', () => {
	it('writes the theme to localStorage under the shared key', () => {
		const { store } = stubWindow();
		persistTheme('dark');
		expect(store.get(THEME_STORAGE_KEY)).toBe('dark');
	});

	it('does nothing when there is no window (SSR)', () => {
		expect(() => persistTheme('dark')).not.toThrow();
	});
});

describe('applyTheme', () => {
	it('reflects the theme on the document element', () => {
		const documentElement = stubDocument();
		applyTheme('dark');
		expect(documentElement.dataset.theme).toBe('dark');
		expect(documentElement.style.colorScheme).toBe('dark');
	});

	it('does nothing when there is no document (SSR)', () => {
		expect(() => applyTheme('dark')).not.toThrow();
	});
});
