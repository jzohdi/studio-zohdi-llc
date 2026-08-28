# Map: Landing page + /work

Label: wayfinder:map

## Destination

**REACHED** — every ticket is resolved and Jake has approved the result on desktop and on a real phone. The prototype lives on `feat/landing-page`. What remains is the production-hardening follow-on listed under Out of scope, which is a fresh effort, not this map's.

An approved, working prototype on a feature branch: a new single-screen landing page at `/`, with today's homepage relocated to `/work`, where the entrance motion and the route transition between the two both feel right to Jake. The map ends at that approval — production hardening ships as a separate follow-on effort.

## Notes

**Domain.** SvelteKit 2 / Svelte 5 runes marketing + portfolio site for Studio Zohdi. Design tokens live in `src/app.css` (HSL custom properties, `[data-theme='dark']` overrides). Brand and motion direction live in `docs/site-spec.md`. `.cursor/rules/studio-zohdi-website.mdc` is an always-on rule for this repo — read it before design work; notably: don't invent brand or portfolio facts, design desktop and mobile together, favour subtle premium motion over flashy, respect `prefers-reduced-motion`.

**Existing machinery worth reusing rather than reinventing.** `src/lib/utils/page-transition.svelte.ts` + `src/lib/components/PageTransition.svelte` already implement a multi-wave panel cover/reveal keyed to the destination route and theme. `src/lib/utils/theme.ts` plus the inline pre-paint script in `src/routes/+layout.svelte` handle theming without a flash. `three` and `three-globe` are already dependencies, and there are hand-rolled canvas graphics in `src/lib/components/projects/` — a signature visual has precedent here.

**Skills each session should consult.** `/impeccable` for any design, motion, or composition work. `/prototype` for prototype tickets. `/grilling` and `/domain-modeling` for decision tickets.

**Branch.** All work lands on `feat/landing-page`, created by [Move today's homepage to /work](issues/02-move-homepage-to-work.md). Build on it rather than branching again.

**Known-red on main.** `pnpm lint` and `pnpm test` already fail on `main` — three unformatted files and one stale assertion in `project-media.spec.ts`. Verified pre-existing. Don't mistake them for your own breakage; `pnpm check` and `pnpm build` are both clean.

**Execution override.** Wayfinder defaults to planning only. This map overrides that: prototype tickets build real code on a feature branch, because the transition can only be judged by feeling it in the real app. The override stops at the destination — nothing past prototype approval gets built here.

**Settled while charting.** `/work` gets minimal adjustments only, not a redesign. The landing page is one fixed screen with no scroll.

## Decisions so far

- [The statement: what Studio Zohdi is, in as few words as possible](issues/01-the-statement.md) — One line, first person, no sector named: _"I take software products from idea to live and keep them growing."_ Plus `See the work →`, `More about me ↗`, and a quieter `let's talk` contact link. The work is client commissions, and Jake works solo.
- [Move today's homepage to /work](issues/02-move-homepage-to-work.md) — Done on branch `feat/landing-page`, uncommitted. Homepage now at `/work` with a placeholder at `/`; all eight routes still prerender. Project pages' brand link repointed to `/work`, which [The transition to /work, and the way back](issues/05-transition-to-work.md) should confirm or overturn.
- [The single-screen composition](issues/03-single-screen-composition.md) — Built and approved: typography alone, the sentence staged as its own span (three stepped beats in /work's display type) and no other ornament: Jake removed the breathing pink full stop and the em dash after seeing them, so the staircase alone carries the idea. Links on the bottom edge in three weights; inline chrome matching /work. `PRODUCT.md` now exists at the repo root.
- [Entrance motion on first load](issues/04-entrance-motion.md) — Approved: the project pages' intro vocabulary (chrome drops in, the three beats rise out of blur top-down, links settle last), ~1.8s to rest, readable by ~0.8s. Plays on every cold load; client-side arrivals land at rest; reduced motion is complete at first paint; hidden tabs can't get stuck.
- [The transition to /work, and the way back](issues/05-transition-to-work.md) — Approved: the studio's pages lead with studio pink in the existing wave system (projects keep their two highlights); `/work`'s wordmark links home, project wordmarks stay pointed at `/work`; `LET'S TALK` unified on one AA-passing `--pink-link` token site-wide; no arrival intro on `/work`; late-start on slow networks accepted.
- [Font swap on the statement](issues/06-font-swap-on-the-statement.md) — The swap is real (~300ms of fallback face even on a fast network, and the fallback is narrower so it reflows). The landing entrance now waits on `document.fonts.ready`, capped at 1.2s; Jake chose to go further and self-host the face — graduated to [Self-host League Spartan](issues/07-self-host-league-spartan.md).
- [Self-host League Spartan](issues/07-self-host-league-spartan.md) — Done: `@fontsource-variable/league-spartan`, one preloaded 24 KB latin file, Google Fonts removed from the layout. On the production build the face is ready 127ms in and the entrance gate is a no-op; `/work` and project pages unchanged.
- [Tab titles for the two pages](issues/08-tab-titles-for-the-two-pages.md) — `/work` is now `Work | Studio Zohdi`; the landing keeps the default title. Meta description left for the out-of-scope SEO pass.
- [Look at it on a real phone](issues/09-look-at-it-on-a-real-phone.md) — Jake checked entrance, transition, and tap targets on a real phone in both themes: all smooth, nothing to change.

## Not yet specified

_(none — everything in scope is either decided or a live ticket)_

## Out of scope

- **Production hardening.** Redirects for existing `/` deep links, sitemap entries for `/work`, canonical / OG / JSON-LD updates, prerender entry generation, analytics. Also the stale `SITE.description` in `src/lib/seo/site.ts`, which names categories (commerce, creative, energy) that no project matches — surfaced while resolving [The statement](issues/01-the-statement.md). Follow-on effort once the prototype is approved.
- **Redesigning the work page.** Ruled out while charting: `/work` keeps its current design and changes only where the new hierarchy forces it.
- **Starting the page cover on click.** The shared transition begins only once the destination's code has loaded, so slow networks see a late start rather than a held cover. Moving the cover into `beforeNavigate` would hide that latency on every route — a site-wide transition change, surfaced and accepted as-is in [The transition to /work, and the way back](issues/05-transition-to-work.md). Worth its own effort if it ever matters.
