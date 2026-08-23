# The single-screen composition

Type: prototype
Status: resolved
Blocked by: 01

## Question

What does the landing page look like — one fixed screen, no scroll, on desktop and mobile together?

Build it, look at it, react to it. The point of a prototype ticket is to raise the fidelity of the argument, so produce something on screen rather than a description of something on screen.

Things this needs to resolve:

- The register. Is this page carried by typography alone — the existing display face at scale, the way `/work` and the 404 page already do it — or does it carry a signature visual: an ambient canvas, a generative mark, something with depth? Both readings are worth building; they are genuinely different pages, and the answer sets the ceiling for the entrance motion.
- Where the five elements sit. [The statement](01-the-statement.md) settled exactly what they are and what they say — the studio name, one sentence, `See the work →`, `More about me ↗`, and a quiet `let's talk` contact link. Read its answer before laying anything out; do not re-litigate the copy here.
- How the three links differ in weight. `See the work` is the primary path deeper into the site, `More about me` sends the visitor away, and `let's talk` was explicitly chosen to sit quieter than both. Three links on a page with one sentence is the whole risk of this composition: get the hierarchy wrong and it reads as navigation.
- Whether one sentence is enough to hold a full screen. The word budget is a hard constraint from [The statement](01-the-statement.md), so the composition has to earn its scale from typography, space, and whatever visual register you land on — not from more words.
- Mobile. One fixed screen is a much tighter constraint at 375px than at 1440px, and the rule for this repo is that both get designed together, not one after the other.
- Whether the page holds up in both themes. Every token already has a dark counterpart; a design that only works in one is not finished.

Consult `/impeccable`. Reuse the tokens in `src/app.css` rather than introducing new colours.

## Answer

**Built on `feat/landing-page`, uncommitted: [`src/routes/+page.svelte`](../../../src/routes/+page.svelte).** Jake approved the direction before it was built; this answer records what was decided and what the build established.

### The composition

**The sentence is a span of time — idea → live → kept there — and the page stages it as that span.** One sentence, set in the house display type (League Spartan 700, uppercase, −0.04em, at `/work`'s project-list scale: `clamp(2.35rem, 5.6vw, 5.25rem)`), broken into its three beats, each beat indented one step further than the last (`clamp(0.9rem, 6vw, 5.5rem)` per step). The eye walks down and to the right, from IDEA to THERE. The sentence's full stop is pink, and a ring breathes out from it on a 2.8s cycle — the period itself is the live-status dot. "Keep them there" becomes something you can see, and the sentence literally ends in a heartbeat. (The first build put a separate dot *after* `THERE.`; the finish review caught that the line then ended in two dots, and the fix — make the full stop the dot — is stronger than the original.)

It refuses two defaults: the centred-tagline-plus-two-buttons landing page, and a reprise of `/work`'s giant list.

**Register: typography alone.** The ticket asked whether the page is carried by type or by a signature visual. Type — the only signature is the dot. The dealt alternatives (a WebGL ink basin, nixie-tube counters, a chromatophore skin, sticker albums) each either broke continuity with `/work` or added interaction a one-sentence page can't justify; none survived the weighing.

**Where the five elements sit.**
- Top: `STUDIO / ZOHDI` wordmark top-left, typeset exactly as `/work`'s `BrandBlock`; a fading hairline rule; the theme toggle top-right (text variant on desktop, compact on mobile) — the same chrome idiom as `/work`, built inline on the landing page so `/work` stays untouched.
- Middle: the statement, as above, vertically centred in the remaining space.
- Bottom edge: `SEE THE WORK →` (primary: foreground, 600, ~1.1rem, 0.2em tracking), `MORE ABOUT ME ↗` (secondary: the `.eyebrow` idiom at foreground/0.62), `LET'S TALK` (tertiary: the same small tracked caps in pink, pushed to the far right, exactly how `/work`'s topbar treats its contact link). Three distinct weights by size, colour, and position — it reads as a signature and two quiet doors, not as a nav.

**Mobile.** Same markup, same rules. The beats wrap to two lines each and keep their indents, so the staircase survives at 375px; the three links stack in the same order at the bottom. Verified no scroll at 375×812, 768×1024, 667×375 (landscape phone — needed a `max-height: 480px` rule to reclaim padding), 1280×640, and 1440×900.

**Both themes.** Only global tokens are used, so dark mode is free and `PageTransition`'s background matching keeps working. Contrast measured over the real background: light — contact 6.6:1, secondary 5.5:1; dark — contact 5.0:1, secondary 7.5:1, primary 19:1. The one derived colour is the light-mode contact link, `color-mix(in oklab, pink 74%, foreground)`, because pink/0.74 on white (the `/work` idiom) only reaches 3:1 at that size.

### What this ticket leaves for the next ones

- **The full stop already breathes** (`.statement__live`, a 2.8s expanding ring driven by `transform` + `opacity` on a pseudo-element; under `prefers-reduced-motion` the ring is gone and the pink period stays). That is the page's only motion at rest. [Entrance motion on first load](04-entrance-motion.md) decides how the page *arrives*; it should treat the dot's pulse as the resting state the entrance settles into, not add a second ambient motion.
- **The statement is three block-level beats** (`.statement__beat`, indexed by `--beat-index`), which is the natural unit for a staged entrance.
- **The landing chrome is inline** (`.landing-topbar`), not the shared `Topbar` component. That was deliberate — `/work` untouched, and chrome placement across the two pages is still an open question for [The transition to /work, and the way back](05-transition-to-work.md).
- **Both `/` and `/work` currently emit `SITE.defaultTitle`** and the same organization/website JSON-LD. The landing page's meta description is the sentence. Duplicate titles are harmless for the prototype but worth a decision before production.

### Process notes

- Impeccable's process required a `PRODUCT.md` before designing a new surface; it now exists at the repo root, written from the wayfinder decisions plus one confirmation round (audience is an equal mix of prospective clients and peers; four guardrails: not agency-slick, no gimmicky motion, no break in continuity with `/work`, not too quiet to be memorable). Jake's answers are recorded there.
- The structure was assigned by the concept-seed roll (key `973bd2f3`): the seventh of my seven grounded structures, which I'd ranked last. That is the roll working as intended.
- `/prototype` was not used: the map's execution override means this is real code on the effort branch, so `/impeccable`'s build flow applied instead.
- No `DESIGN.md` was written: this extends an established world rather than creating one. Documenting the incumbent system is a separate, worthwhile follow-up.
- Mechanical detector: no findings. `svelte-check`, eslint, prettier, `pnpm build`: clean.
- An independent finish review (a general-purpose subagent briefed as the reviewer — this install ships no dedicated reviewer agent) returned *fix-then-ship*. Applied: the full stop as the live dot; the external link announces it opens a new tab; the statement's fluid size raised to `6.6vw` so it reaches `/work`'s 84px on ordinary laptops rather than only past 1500px; a `color-mix()` fallback; a non-motion hover on the primary link. Deferred to [The transition to /work, and the way back](05-transition-to-work.md) because they touch `/work`: unifying the contact-link pink (`/work`'s `hsl(pink / 0.74)` only reaches ~3:1 on white) and the `LET'S TALK!` vs `LET'S TALK` label; and whether the wordmark should sit in the same row on both pages so it holds still through the transition. Declined: a static tonal progression across the three beats — it would borrow `/work`'s inactive register for the opening words, and tone-as-progression belongs to the *entrance* if anywhere.

### Amendment (Jake, after review)

Jake asked for the pulsing dot and the em dash to be removed, and they were. The sentence ends in a plain full stop in the foreground colour; beat two reads `FROM IDEA TO LIVE`. The page's only motion at rest is now none — the staircase alone carries the idea, and pink appears only on the contact link. [Entrance motion on first load](04-entrance-motion.md) therefore starts from a fully still page.
