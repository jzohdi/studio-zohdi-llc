# Self-host League Spartan

Type: task
Status: resolved
Blocked by: —

## Question

Ship League Spartan with the site instead of loading it from Google Fonts, so the landing page's first paint never waits on a third party and the display weight can be preloaded.

Decided in [Font swap on the statement](06-font-swap-on-the-statement.md): Jake chose self-hosting over living with the capped `fonts.ready` gate alone. The gate stays as belt-and-braces.

This is mechanical, not a design decision — AFK. What it covers:

- Add the face as a local dependency (e.g. `@fontsource/league-spartan`, weights 400–800 to match today's Google Fonts request, latin subset) or vendor the woff2 files under `static/fonts/` with hand-written `@font-face` rules. Prefer whichever keeps the build simple; record the choice.
- Remove the `preconnect` links and the Google Fonts `<link rel="stylesheet">` from `src/routes/+layout.svelte`. That link is render-blocking and sits above the inline theme script, which waits on it — so this also unblocks first paint on every page.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the 700 weight (the statement, `/work`'s list, project titles). Consider whether 600 (wordmarks, primary link) earns one too; don't preload all five.
- Keep `font-display: swap` (or argue for `optional` on the display face) — the landing page's gate covers the statement either way.
- `scripts/generate-og-image.mjs` loads the face from Google Fonts at build time for the share card; it can keep doing so, or point at the local files — note which.
- Verify: `pnpm build` clean; the prerendered HTML carries the preload; a cold load of `/` in headless Chromium shows League Spartan in the first visible frame with the gate rarely waiting; `/work` and a project page render identically to before.

The answer should record the package/version or file list, the preload decision, and any size delta.

## Answer

**Done on `feat/landing-page` (uncommitted).**

### What changed

| Where | Change |
| --- | --- |
| `package.json` / `pnpm-lock.yaml` | `@fontsource-variable/league-spartan@5.3.0` added as a dependency. The **variable** build was chosen over the static per-weight package: one weight axis (100–900) per script subset, so every weight the site uses (400–800) comes from one file, and there is exactly one file to preload. |
| `src/routes/+layout.svelte` | Imports the package's CSS (three `@font-face` rules — latin, latin-ext, vietnamese — each `font-display: swap`, `unicode-range`-scoped, so browsers only fetch the subsets a page actually uses). Imports the latin woff2 `?url` and emits `<link rel="preload" as="font" type="font/woff2" crossorigin>` for it. The two `preconnect`s and the Google Fonts `<link rel="stylesheet">` are gone. |
| `src/app.css`, `src/error.html` | `--font-display` now starts with `'League Spartan Variable'` (the package's family name), keeping `'League Spartan'` in the stack behind it. |
| `docs/site-spec.md` | One line noting the face is self-hosted. |

`scripts/generate-og-image.mjs` still loads the face from Google Fonts: it runs at build time in headless Chromium to render the share card, never in a visitor's browser, so it was left alone.

### Preload decision

Preload the **latin** variable file only (24 KB). That one file carries every weight, so there is no 600-vs-700 question to argue; latin-ext (20 KB) and vietnamese (8.5 KB) are only requested if a page contains those ranges, which none does today. The arrows `→` / `↗` sit outside the face's unicode ranges (as they did with Google Fonts) and fall through to the next font in the stack, unchanged.

### Measured on the production build (`vite preview`, headless Chromium, 1440×900)

- **One** font request for `/`: `/_app/immutable/assets/league-spartan-latin-wght-normal.<hash>.woff2`. No request to `googleapis` or `gstatic` anywhere.
- `document.fonts.status === 'loaded'` and `fonts.check('700 80px "League Spartan Variable"') === true` at the first sample, **127ms** after navigation commit — at which point the entrance was already `active`. The `fonts.ready` gate from [Font swap on the statement](06-font-swap-on-the-statement.md) is now effectively a no-op on a normal connection; it stays for the slow ones.
- `/work` and `/projects/foia-search` render identically to before, in `League Spartan Variable`, including the SVG title outline effect.
- Prerendered HTML carries the preload; `pnpm build`, `svelte-check` (847 files), eslint, prettier clean.

### Size delta

+24 KB (latin woff2) on first visit, cached immutably thereafter — versus Google's CSS request plus its font files, and minus the render-blocking third-party round trips that were also holding up the inline theme script on every page.

### One thing to know

`remotion/` has its own font loading (`remotion/src/lib/fonts.ts`) for the preview videos and is untouched — it is a separate build.
