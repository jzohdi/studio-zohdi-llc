# The transition to /work, and the way back

Type: prototype
Status: resolved
Blocked by: 02, 03

## Question

What does routing from the landing page to `/work` feel like — and how does a visitor get back?

The site already has a strong transition system: `PageTransition` wipes staggered panels up over the viewport in coloured waves, holds navigation until the viewport is fully covered, then lifts them away over the freshly mounted page. Project links lead with that project's two highlight colours before settling on the destination background. The landing → work move is the most important navigation on the site and deserves the same deliberateness.

What [The single-screen composition](03-single-screen-composition.md) handed over: the landing page uses only global tokens, so `backgroundColorFor()`'s existing non-project branch already returns the right cover colour for both `/` and `/work` unless this ticket wants them to differ. The landing chrome (wordmark, rule, theme toggle) is built inline, not with the shared `Topbar`; `/work` still renders its own `Topbar` with `DARK MODE` + `LET'S TALK!` and no brand link — the route home decided here is the thing that reconciles the two.

[Entrance motion on first load](04-entrance-motion.md) settled that a client-side arrival at `/` (including browser back) lands instantly at rest — the cover/reveal is the only motion a returning visitor sees, so this ticket owns the whole feel of coming back.

Two continuity deltas the landing page's finish review surfaced, both on the `/work` side and both small enough for "minimal adjustments": (1) `/work`'s contact link is `hsl(var(--pink) / 0.74)` at 0.72rem — about 3:1 on white, under AA — and labelled `LET'S TALK!`, while the landing page's is a foreground-mixed pink at 6.6:1 labelled `LET'S TALK`; the one accent link changes shade and gains an exclamation mark on click-through. (2) The landing wordmark sits on the rule row (as project pages do); `/work`'s sits a row lower in `BrandBlock`, so the mark jumps ~1.5rem through the transition. Decide both here, alongside the route home.

Things this needs to resolve:

- What the landing → `/work` transition looks like. Does it reuse the existing wave system with its own colours, or does this particular move want something of its own — the landing composition itself carrying through, for instance?
- What colour the cover settles on. `backgroundColorFor()` in `src/lib/utils/page-transition.svelte.ts` currently reads any non-project route as the homepage; with two non-project routes it needs a real answer for each.
- What a visitor sees on arrival at `/work`. The existing page has no arrival treatment because it was the first thing anyone saw; now it is a second step.
- The project pages' brand link. [Move today's homepage to /work](02-move-homepage-to-work.md) repointed the "Studio Zohdi" wordmark in `ProjectPageTopbar` from `/` to `/work`, to preserve what it did — get back to the project list. That's a working default, not a decision: a brand wordmark conventionally means "home", and there is now a home that isn't the list. Confirm it or overturn it here.
- The way back. `/work` needs a route home, and the map settled that `/work` gets minimal adjustments only — so this is a small, precise addition, not a new nav. What is it, where does it sit, and does going back get its own transition or reuse the same one?
- Whether it holds up on a slow connection, when the covered state lasts longer than the animation intends.

Consult `/impeccable`. This can only be judged in the real app, on the branch from [Move today's homepage to /work](02-move-homepage-to-work.md).

## Answer

**Built and approved on `feat/landing-page` (uncommitted).** Files: `src/lib/utils/page-transition.svelte.ts`, `src/lib/components/home/BrandBlock.svelte`, `src/lib/components/home/Topbar.svelte`, `src/lib/components/projects/ProjectPageTopbar.svelte`, `src/app.css`, `src/routes/+page.svelte`.

### The transition: every destination leads with its own colour

The existing wave system is kept — no second transition idiom. The rule in `coverWavesFor()` is now uniform: a project page leads with its two title-highlight colours then settles on its background (three sweeps, unchanged); **the studio's own pages — `/` and `/work` — lead with the studio pink, then settle on the background (two sweeps).** That applies to any navigation *into* `/` or `/work`, including a project page's wordmark back to the list. The alternative — the landing composition itself carrying through — was not pursued: it would be a new system alongside a strong existing one.

Measured: click → cover starts immediately when the route is already loaded, fully covered at ~1.1s, reveal lifts, idle by ~2.4s (landing → work); the return trip is ~0.2s shorter because the landing is lighter. The cover colour is the global background token in both themes, so `backgroundColorFor()` needed no change beyond its comment.

### Arrival at `/work`

Nothing added. The staggered reveal *is* the arrival treatment; an intro on `/work` on top of it would be double motion, and `/work` is minimal-adjustments only.

### The way back: the wordmark

`STUDIO ZOHDI` on `/work` (the `BrandBlock` h1) is now a link to `/`, with a quiet hover and hover-preload. Zero layout change — Jake chose this over moving the wordmark onto the rule row (pixel-stable through the wipe, but reshapes `/work`'s header) or adding a separate ← HOME control. The ~1.5rem row difference between the landing wordmark and `/work`'s is accepted: a full-viewport wipe hides it.

### The project pages' wordmark

**Stays pointed at `/work`** — Jake confirmed the working default from [Move today's homepage to /work](02-move-homepage-to-work.md). From a case study a visitor wants the other projects; the landing page is one more click via `/work`'s wordmark.

### Contact link: one label, one shade

Jake chose to unify on the landing page's version: **`LET'S TALK`** (no exclamation mark) on `/work`, the project pages, and the landing, all coloured by a new `--pink-link` token in `app.css` — `color-mix(in oklab, pink 74%, foreground)` on the light ground (≈6.6:1 at 0.72rem, AA), full pink on the dark ground (≈5:1), with a plain-pink fallback for browsers without `color-mix`. Hover goes to foreground everywhere. This also fixes `/work`'s and the project pages' pre-existing ~3:1 contact link. The project pages were included because the label and shade would otherwise still change on the work → project step; it is one token and one word.

### Slow connections

Verified, and accepted by Jake as-is: SvelteKit runs `onNavigate` — where the cover starts — only after the destination's code has loaded. So on a slow connection the wipe doesn't hold longer than designed; it **starts late** (probe: a 1.5s-delayed module meant ~3s of nothing, then the full wipe). Every page is prerendered and links preload on hover, so in practice the code is nearly always present. The alternative — start the cover in `beforeNavigate` and hold — is a site-wide transition change and is recorded on the map as out of scope for this effort.

### Process

Decisions taken via one structured round (way back / brand link / contact), then built, then verified with a Playwright probe (scratchpad `entrance/transition.mjs`, `slow.mjs`); Jake approved the transition from frames. Build clean; prerendered `/work` carries `href="./"` on the wordmark; `LET'S TALK` appears once per page; detector, prettier, svelte-check clean. `pnpm test` still shows only the pre-existing `project-media.spec` failure.
