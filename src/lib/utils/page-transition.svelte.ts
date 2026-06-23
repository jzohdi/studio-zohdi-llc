import { runAfterInitialPaint } from '$lib/utils/after-paint';
import { getProjectPage } from '$lib/data/project-pages';
import { resolveTheme, type ThemeName } from '$lib/utils/theme';

/**
 * Phases of the page-cover transition.
 * - `idle`: overlay parked off-screen, nothing happening.
 * - `covering`: panels wiping up to fully cover the viewport.
 * - `covered`: viewport fully covered; safe to swap the page underneath.
 * - `revealing`: panels continuing up and off-screen to expose the new page.
 */
export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

/** Number of staggered panels that make up a single cover sweep. */
export const PANEL_COUNT = 6;

export const COVER_DURATION_MS = 540;
export const COVER_STAGGER_MS = 48;
export const REVEAL_DURATION_MS = 620;
export const REVEAL_STAGGER_MS = 44;

/**
 * Delay between the start of each successive cover sweep. Smaller than a single
 * sweep so multiple coloured waves overlap into one quick, layered motion.
 */
export const WAVE_OFFSET_MS = 130;

/** Total time for every panel in a single sweep to finish wiping closed. */
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

/** Pulls the `{slug}` out of a `/projects/{slug}` pathname, if present. */
function projectSlugFromPath(pathname: string): string | null {
	const match = pathname.match(/^\/projects\/([^/]+)\/?$/);
	return match ? match[1] : null;
}

/**
 * Ordered colours for the cover sweeps. Navigating to a project page leads with
 * the project's two title-highlight colours (its brand pink + accent) before
 * settling on the destination background, producing three quick successive
 * sweeps. Every other navigation uses a single background sweep.
 */
function coverWavesFor(pathname: string, theme: ThemeName): string[] {
	const background = backgroundColorFor(pathname, theme);
	const slug = projectSlugFromPath(pathname);
	const project = slug ? getProjectPage(slug) : null;

	if (!project) {
		return [background];
	}

	const { primary, secondary } = project.titleHighlight;
	return [primary, secondary, background];
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class PageTransitionController {
	phase = $state<TransitionPhase>('idle');
	/** Ordered colours for each cover sweep; the last one matches the new page. */
	waves = $state<string[]>([LIGHT_BACKGROUND]);

	private revealTimeout = 0;
	private coverTimeout = 0;
	private cancelCoverStart: (() => void) | null = null;

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
		window.clearTimeout(this.coverTimeout);
		this.cancelCoverStart?.();

		this.waves = coverWavesFor(targetPathname, resolveTheme());

		// The viewport is only fully covered once the final, last-starting sweep
		// has finished wiping closed.
		const coverTotalMs = COVER_TOTAL_MS + WAVE_OFFSET_MS * (this.waves.length - 1);

		return new Promise<() => void>((resolve) => {
			// Wait for the (possibly newly created) wave panels to mount and paint
			// in their parked, off-screen position before flipping to `covering`.
			// Without this, freshly added wave layers would mount already covered
			// and skip the wipe entirely.
			this.cancelCoverStart = runAfterInitialPaint(() => {
				this.cancelCoverStart = null;
				this.phase = 'covering';
				this.coverTimeout = window.setTimeout(() => {
					this.phase = 'covered';
					resolve(this.reveal);
				}, coverTotalMs);
			});
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
