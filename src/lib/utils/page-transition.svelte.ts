import { resolveTheme, type ThemeName } from '$lib/utils/theme';

/**
 * Phases of the page-cover transition.
 * - `idle`: overlay parked off-screen, nothing happening.
 * - `covering`: panels wiping up to fully cover the viewport.
 * - `covered`: viewport fully covered; safe to swap the page underneath.
 * - `revealing`: panels continuing up and off-screen to expose the new page.
 */
export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

/** Number of staggered panels that make up the cover. */
export const PANEL_COUNT = 6;

export const COVER_DURATION_MS = 540;
export const COVER_STAGGER_MS = 48;
export const REVEAL_DURATION_MS = 620;
export const REVEAL_STAGGER_MS = 44;

/** Total time for every panel to finish wiping the viewport closed. */
export const COVER_TOTAL_MS = COVER_DURATION_MS + COVER_STAGGER_MS * (PANEL_COUNT - 1);
/** Total time for every panel to clear the viewport on the way out. */
export const REVEAL_TOTAL_MS = REVEAL_DURATION_MS + REVEAL_STAGGER_MS * (PANEL_COUNT - 1);

const LIGHT_BACKGROUND = 'hsl(0 0% 100%)';
const PROJECT_DARK_BACKGROUND = 'hsl(220 14% 7%)';
const HOME_DARK_BACKGROUND = 'hsl(222.2 84% 4.9%)';

/**
 * Resolves the solid colour the cover should settle on so it matches the
 * destination page background exactly (which makes the reveal seamless).
 */
function backgroundColorFor(pathname: string, theme: ThemeName): string {
	if (theme !== 'dark') {
		return LIGHT_BACKGROUND;
	}

	return pathname.startsWith('/projects/') ? PROJECT_DARK_BACKGROUND : HOME_DARK_BACKGROUND;
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class PageTransitionController {
	phase = $state<TransitionPhase>('idle');
	color = $state(LIGHT_BACKGROUND);

	private revealTimeout = 0;

	/**
	 * Starts the cover animation toward `targetPathname`. Returns a promise that
	 * resolves once the viewport is fully covered, yielding a callback that the
	 * caller should run after the new page has been mounted to play the reveal.
	 *
	 * Returns `undefined` when motion should be skipped, signalling the caller to
	 * navigate instantly.
	 */
	cover(targetPathname: string): Promise<() => void> | undefined {
		if (prefersReducedMotion()) {
			return undefined;
		}

		window.clearTimeout(this.revealTimeout);
		this.color = backgroundColorFor(targetPathname, resolveTheme());
		this.phase = 'covering';

		return new Promise<() => void>((resolve) => {
			window.setTimeout(() => {
				this.phase = 'covered';
				resolve(this.reveal);
			}, COVER_TOTAL_MS);
		});
	}

	private reveal = () => {
		// Give the freshly mounted page one frame to paint underneath the cover
		// before the panels lift away, so nothing flashes through.
		window.requestAnimationFrame(() => {
			if (this.phase !== 'covered') {
				return;
			}

			this.phase = 'revealing';
			this.revealTimeout = window.setTimeout(() => {
				this.phase = 'idle';
			}, REVEAL_TOTAL_MS);
		});
	};
}

export const pageTransition = new PageTransitionController();
