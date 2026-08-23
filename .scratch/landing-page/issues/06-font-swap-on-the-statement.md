# Font swap on the statement

Type: prototype
Status: resolved
Blocked by: 04

## Question

Does the landing page need a font-loading strategy, and if so which one?

League Spartan loads from Google Fonts via a `<link rel="stylesheet">` in `src/routes/+layout.svelte` with `display=swap`. On `/work` a swap is tolerable — there's a lot on screen. On the landing page the statement *is* the screen: three lines of display type at up to 5.25rem, set in a condensed bold face whose fallback (`'Arial Narrow', 'Helvetica Neue', sans-serif`) has very different metrics. A visible swap would be the first thing a cold visitor sees.

Things this needs to resolve:

- Whether the swap is actually visible in practice — throttle the network, hard-reload, watch. Don't fix what can't be seen.
- If it is: which lever. `<link rel="preload">` for the specific woff2; self-hosting the face; a `size-adjust` / `ascent-override` fallback face so the fallback occupies the same box; or simply gating the entrance on `document.fonts.ready` so the statement never paints in the wrong face at all.
- Whether [Entrance motion on first load](04-entrance-motion.md) has already solved it — an entrance that reveals the statement after a short beat can mask the swap for free, which is why this ticket is blocked behind it.
- Cost to `/work` and the project pages, which share the layout's font loading.

This is a prototype ticket because the answer is judged by watching a cold load, not by reading a spec.

## Answer

**Yes, the swap is real, and the landing page now gates its entrance on the display font. Jake chose to go further and self-host League Spartan — that is [Self-host League Spartan](07-self-host-league-spartan.md).**

### What was measured (headless Chromium against the dev server)

- **Fast network, no gate:** at ~600ms the wordmark was at 85% opacity and the first beat at 30% while `document.fonts.status` was still `loading`; League Spartan landed at ~900ms. So the entrance was revealing text in the fallback face for roughly 300ms, then swapping. The blur on the beats masks some of it; the wordmark, which leads at 0ms and is crisp by then, is exposed.
- **The fallback reflows.** `'Arial Narrow'` bold is markedly narrower than League Spartan 700 (the first beat ends ~60px earlier at 1440px), so a mid-entrance swap is a visible width jump on the biggest type on the page, not a subtle glyph change.
- **Font files blocked entirely:** `document.fonts.ready` still resolves (a failed load counts as done), so the entrance plays in the fallback and nothing hangs.
- **A side finding that belongs to the self-host ticket:** the Google Fonts `<link rel="stylesheet">` in `src/routes/+layout.svelte` is render-blocking *and* sits above the inline theme `<script>`, which must wait for it — so first paint of every page waits on Google's CSS. Timing probes with network interception were unreliable because the interception itself added latency, but the structural fact stands from the head order.

### What was built (landing page only)

In `src/routes/+page.svelte`, the cold-load entrance now starts only after `Promise.race([document.fonts.ready, 1200ms])`, then the usual one-frame-after-paint wait. The existing hard ceiling (now 2.6s) still guarantees the page reaches rest whatever happens. Measured with the gate: the page holds `pending` until fonts are `loaded` (~640ms on the test network), then the entrance plays entirely in League Spartan — about 300ms later than before, never in the fallback. With fonts blocked it plays in the fallback after the cap. `/work` and the project pages are untouched.

### The decision

Offered: keep the gate (landing-only, cheap), accept the swap, or self-host the face. **Jake chose to self-host League Spartan.** That removes the third-party render-blocking stylesheet from every page, lets the display weight be preloaded, and makes the gate nearly always a no-op — it stays as belt-and-braces. It is a dependency and a layout change, so it is its own ticket rather than a side effect of this one.

### Process

Probes live in the scratchpad (`entrance/fonts.mjs`, `fout.mjs`, `nofont.mjs`); screenshots of the fallback face and the gated entrance were sent to Jake. `svelte-check`, eslint, prettier clean.
