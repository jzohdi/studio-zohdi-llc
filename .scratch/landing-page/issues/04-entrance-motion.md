# Entrance motion on first load

Type: prototype
Status: resolved
Blocked by: 03

## Question

What happens in the first two seconds a visitor arrives?

This is the page's whole first impression: there is nothing to scroll to, so the entrance *is* the experience. It has to feel considered rather than decorative, and it has to be over quickly enough that a returning visitor isn't made to sit through it.

What [The single-screen composition](03-single-screen-composition.md) handed over: the statement is three block-level beats (`.statement__beat`, each with a `--beat-index`) on a staircase indent; the page is completely still at rest — Jake removed the breathing live dot after seeing it — so whatever the entrance does, it settles into stillness.

Things this needs to resolve:

- What animates, in what order, and how long the whole sequence takes before the page is at rest.
- Which existing vocabulary this borrows from. The repo already has a word-by-word reveal (`TextGenerateReveal`), an SVG title outline effect (`ProjectTitleHoverEffect`), and staggered panel wipes (`PageTransition`) — reusing that language keeps the site coherent; inventing a fifth motion idiom needs a reason.
- Whether the entrance replays on every visit or settles after the first.
- What a visitor who arrives with `prefers-reduced-motion` set sees instead — not "nothing moves", but a version of the page that still feels finished.
- How it behaves when the visitor arrives *back* from `/work`, which is a different arrival from a cold load and shouldn't repeat the full sequence.

Consult `/impeccable`. Judge it by watching it, repeatedly, not by reading the timings.

## Answer

**Built, approved by Jake as-is, on `feat/landing-page` (uncommitted): [`src/routes/+page.svelte`](../../../src/routes/+page.svelte).**

### The sequence

One authored moment, borrowed wholesale from the project pages' intro so the site speaks one motion language — no fifth idiom. Everything moves on `opacity` + `transform` + a bounded `filter: blur`, with the same `cubic-bezier(0.22, 1, 0.36, 1)` deceleration the project pages use.

| t (ms) | what |
| --- | --- |
| 0 / 110 / 220 | `STUDIO ZOHDI` wordmark, then the hairline rule (scales out from the left), then the theme toggle — drop in from 0.9rem above, out of a 0.3rem blur. 760–820ms each. |
| 180 / 330 / 480 | The three beats of the statement rise 2.4rem out of a 0.62rem blur (scale 0.985 → 1), one after another — the staircase draws itself top-down, which is the span of the sentence read in time as well as in space. 860–960ms each. |
| 860 / 950 / 1040 | `SEE THE WORK →`, `MORE ABOUT ME ↗`, `LET'S TALK` fade up last, 620ms each. |

Measured in headless Chromium: the first beat is legible by ~700ms, the whole statement by ~1.1s, the page fully at rest at ~1.8s. Nothing else moves once it's done — the page is still.

### The rules

- **Replays on every cold load** (Jake's choice over once-per-session / once-ever). Nothing is persisted; simplest rule, and the sequence is short enough that a refresh isn't a punishment.
- **Client-side arrivals land at rest.** The component reads `navigating.to` at creation: non-null means it's being created mid-navigation (e.g. back from `/work`, or a popstate), so it starts in the `instant` state and never passes through `pending`. `afterNavigate` backs this up for any non-`enter` navigation type. Verified: after click-through to `/work` and browser back, `data-intro="instant"` and every element is at opacity 1 with no transition. So [The transition to /work, and the way back](05-transition-to-work.md) can rely on the page-transition reveal lifting onto a finished page.
- **`prefers-reduced-motion`:** all entrance transitions are `none` and the pending state is forced to rest, so the page is complete at first paint — verified at 120ms, everything at opacity 1. Hover nudges on the link arrows are also off; the primary link still changes colour on hover.
- **No JS:** content is visible by default; the hidden `pending` state only applies under `html[data-js='true']`, which the layout's inline script sets.
- **Hidden tabs:** found during verification — `requestAnimationFrame` never fires in a background tab, so a page opened with cmd-click would have sat blank until focused. A 2s `setTimeout` fallback now guarantees the flip to `active`; whichever of rAF/timeout fires first cancels the other.

### Mechanics worth knowing

- State lives in one `data-intro` attribute on `.landing-shell` (`pending` → `active`, or `instant`); each animated element carries its own `--intro-delay` (topbar from `--intro-index`, beats from `--beat-index`, links from `--link-index`).
- The links' `transition` carries both hover colour and the entrance; `transition-delay` is set per-property so the hover colour is never delayed by the entrance.
- `will-change` is applied only while `pending`/`active`, not permanently.
- The `instant` state zeroes the entrance transitions without touching the hover ones.

### Observed, for [Font swap on the statement](06-font-swap-on-the-statement.md)

In the headless cold-load frames the wordmark at 300ms looked like it might be rendering in the fallback face before League Spartan arrived. The entrance hides the statement for its first ~180–480ms per beat, which masks most of a swap on the big type — but the wordmark leads at 0ms and is the most exposed. Start there.

### Process

`/impeccable animate` playbook applied: one rehearsed focal sequence, materials chosen by meaning, timing from the 500–800ms "authored entrance" band, exit-faster-than-entrance not applicable (nothing exits). Verified with a Playwright probe (scratchpad `entrance/probe.mjs`) rather than the in-app browser pane, which was hidden and therefore froze all transitions. `svelte-check`, eslint, prettier clean.
