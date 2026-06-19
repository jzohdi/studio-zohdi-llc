export type ThemeName = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'studio-zohdi-theme';

export function getSystemTheme(): ThemeName {
	if (typeof window === 'undefined') {
		return 'light';
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readStoredTheme(): ThemeName | null {
	if (typeof window === 'undefined') {
		return null;
	}

	const value = window.localStorage.getItem(THEME_STORAGE_KEY);
	return value === 'light' || value === 'dark' ? value : null;
}

export function resolveTheme(): ThemeName {
	return readStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: ThemeName) {
	if (typeof document === 'undefined') {
		return;
	}

	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
}

export function persistTheme(theme: ThemeName) {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function toggleTheme(theme: ThemeName): ThemeName {
	return theme === 'dark' ? 'light' : 'dark';
}
