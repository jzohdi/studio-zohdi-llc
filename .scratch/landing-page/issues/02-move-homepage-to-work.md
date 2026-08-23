# Move today's homepage to /work

Type: task
Status: resolved
Blocked by: —

## Question

Relocate the existing homepage to `/work` on a feature branch, so that a real destination exists to route to and the transition can be judged by feeling it rather than imagining it.

This is mechanical, not a design decision — it exists to unblock the transition ticket. It is AFK: no human input needed beyond review.

Scope:

- Move `src/routes/+page.svelte` to `src/routes/work/+page.svelte`. Its imports (`BrandBlock`, `DesktopShowcase`, `MobileShowcase`, `Topbar`, `Seo`) and its theme wiring come along unchanged.
- Leave a placeholder at `/` so the app still builds and both routes are reachable. The real landing page arrives via the composition and motion tickets.
- Update internal links that point at the homepage. Note that `src/lib/utils/page-transition.svelte.ts` branches on `pathname.startsWith('/projects/')` versus everything else to pick the cover colour, and the "everything else" branch currently means the homepage — that logic now has two non-project routes to distinguish, which the transition ticket will decide on.
- Keep it building and passing: `pnpm check`, `pnpm lint`, `pnpm test`.

Explicitly not in this ticket, and not in this map at all: redirects for the old `/` URL, sitemap entries, canonical and OG updates, prerender entry generation. Those are out of scope — see the map.

The answer should record the branch name, where things landed, and anything discovered that later tickets depend on.

## Answer

Done. Branch: **`feat/landing-page`** — one branch for the whole effort, so the composition, motion, and transition tickets build on top of this rather than each spinning up their own.

**The changes are uncommitted.** Nothing has been committed or pushed; the working tree on `feat/landing-page` holds them.

### What moved

| File | Change |
| --- | --- |
| `src/routes/+page.svelte` → `src/routes/work/+page.svelte` | `git mv`. Contents unchanged apart from the canonical fix below. |
| `src/routes/+page.svelte` (new) | Deliberately unstyled placeholder: a "landing page placeholder" label and a `See the work →` link. Carries `<meta name="robots" content="noindex">` so a stray deploy can't index it. Marked in a comment as owned by the composition and motion tickets — it is not a design proposal. |
| `src/lib/components/projects/ProjectPageTopbar.svelte` | Brand link `resolve('/')` → `resolve('/work')`. See below. |
| `.claude/launch.json` (new) | Dev-server config so the prototype tickets can drive a live browser. `pnpm dev` on port 5173. |
| `.prettierignore` | Added `/.scratch/`. Without it the map's own markdown fails `prettier --check .` and makes `pnpm lint` redder than it already is. |

### Two judgement calls worth flagging

**The project-page brand link now goes to `/work`, not `/`.** On a project page, the "Studio Zohdi" wordmark in the topbar was the way back to the project list. After the move, `/` no longer holds that list, so leaving the link alone would have silently changed what it does. Preserving its *function* meant repointing it. But a brand wordmark conventionally means "home", and there is now a home that isn't the list — so this is really a navigation decision, and it belongs to [The transition to /work, and the way back](05-transition-to-work.md). The current state is a working default, not a settled answer; that ticket should confirm or overturn it.

**The canonical on `/work` was updated to `path="/work"`.** The moved page still passed `path="/"` to `Seo`, which would have emitted a canonical pointing at the landing page from `/work` — a bug introduced by the move rather than pre-existing SEO debt, so it was fixed here. The rest of the SEO surface was left alone: `/work` still carries `SITE.defaultTitle`, which the "on-page identity" fog will revisit.

### Verified

- `pnpm check` — 846 files, 0 errors, 0 warnings.
- `pnpm build` — clean. All eight routes prerender: `/`, `/work`, and the six project pages.
- `/work` serves the full showcase in a browser: project list, preview carousel playing, topbar intact.
- `/work` canonical resolves to `https://studio-zohdi-llc.com/work`.
- From `/projects/foia-search`, the brand link resolves to `http://localhost:5173/work` (SvelteKit emits it as the relative `../work` in prerendered output, which is correct).

### Facts later tickets depend on

- **`backgroundColorFor()` in `src/lib/utils/page-transition.svelte.ts` was deliberately left alone.** It branches project-route versus everything-else, and both `/` and `/work` now fall into "everything else" — which is still *correct*, since both use the global `--background` token. It only needs changing if [The transition to /work, and the way back](05-transition-to-work.md) wants the two routes to cover in different colours.
- **The sitemap still lists `/` and not `/work`.** Confirmed in the built output. Out of scope by design; noted so the follow-on effort doesn't have to rediscover it.
- **`pnpm lint` and `pnpm test` are red on `main`, before any of this work.** Prettier flags `src/error.html`, `src/lib/components/projects/project-media.ts`, and `src/lib/data/project-pages.ts`; and `project-media.spec.ts:203` asserts a `remotion/public/...` path where the code now returns `/project-previews/...`. Verified by checking out `main` and running both. Not this map's problem — spun off as a separate background task — but any future session that runs those commands should not read the failures as its own.

### Housekeeping for Jake

Stashing during verification left two entries. `stash@{0}` is mine — "WIP on feat/landing-page", verified byte-identical to the working tree, so it is pure redundancy and safe to drop with `git stash drop stash@{0}`. It was left rather than dropped because discarding a stash isn't mine to do unasked. **`stash@{1}` — "WIP on main" — is pre-existing and was not touched.**

That same `git stash -u` also removed the empty `.claude/` directory (`-u` cleans untracked directories). It held no files; it has been recreated and now holds `launch.json`.
