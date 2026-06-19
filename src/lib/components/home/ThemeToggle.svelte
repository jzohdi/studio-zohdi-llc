<script lang="ts">
	import type { ThemeName } from '$lib/utils/theme';

	type ThemeToggleVariant = 'text' | 'compact';

	interface Props {
		theme: ThemeName;
		onToggle: () => void;
		variant?: ThemeToggleVariant;
	}

	let { theme, onToggle, variant = 'text' }: Props = $props();

	let isDark = $derived(theme === 'dark');
	let nextThemeLabel = $derived(isDark ? 'light' : 'dark');
</script>

<button
	type="button"
	class={`theme-toggle theme-toggle--${variant}`}
	data-theme={theme}
	aria-label={`Switch to ${nextThemeLabel} theme`}
	aria-pressed={isDark}
	onclick={onToggle}
>
	{#if variant === 'compact'}
		<span class="theme-toggle__icon" aria-hidden="true">
			{#if isDark}
				<svg viewBox="0 0 24 24" class="theme-toggle__svg">
					<path d="M21 12.8A8.9 8.9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" class="theme-toggle__svg">
					<circle cx="12" cy="12" r="4.2" />
					<path d="M12 2.5v2.2" />
					<path d="M12 19.3v2.2" />
					<path d="m4.9 4.9 1.5 1.5" />
					<path d="m17.6 17.6 1.5 1.5" />
					<path d="M2.5 12h2.2" />
					<path d="M19.3 12h2.2" />
					<path d="m4.9 19.1 1.5-1.5" />
					<path d="m17.6 6.4 1.5-1.5" />
				</svg>
			{/if}
		</span>
	{:else}
		<span class="theme-toggle__label">DARK MODE</span>
		<span class="theme-toggle__status" aria-hidden="true">
			<span class="theme-toggle__dot"></span>
			<span class="theme-toggle__state">{isDark ? 'ON' : 'OFF'}</span>
		</span>
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.7rem;
		cursor: pointer;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
		transition:
			transform 180ms ease,
			opacity 180ms ease,
			border-color 180ms ease,
			background-color 180ms ease,
			color 180ms ease;
	}

	.theme-toggle:hover {
		transform: translateY(-1px);
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	.theme-toggle--text {
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: hsl(var(--muted-foreground));
	}

	.theme-toggle--compact {
		width: 2.9rem;
		height: 2.9rem;
		border: 1px solid hsl(var(--border));
		border-radius: 999px;
		background: hsl(var(--background) / 0.84);
		backdrop-filter: blur(20px);
		box-shadow: 0 16px 38px hsl(222 28% 16% / 0.12);
	}

	.theme-toggle--compact[data-theme='dark'] {
		background: hsl(var(--card) / 0.88);
	}

	.theme-toggle__status {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.theme-toggle__dot {
		width: 0.42rem;
		height: 0.42rem;
		border-radius: 999px;
		background: currentColor;
		opacity: 0.48;
	}

	.theme-toggle__state {
		min-width: 1.4rem;
		font-size: 0.68rem;
	}

	.theme-toggle--text[data-theme='dark'] {
		color: hsl(var(--foreground) / 0.8);
	}

	.theme-toggle__icon {
		display: grid;
		place-items: center;
		width: 1.2rem;
		height: 1.2rem;
	}

	.theme-toggle__svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}
</style>
