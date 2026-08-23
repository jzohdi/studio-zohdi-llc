# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences of roughly equal weight, confirmed by Jake:

- **Prospective clients evaluating whether to hire Studio Zohdi.** Typically arrive via referral, an email signature, or from one of the live products the studio built. Their job on the site: in seconds, understand what the studio does and decide whether to look closer at the work.
- **Peers, collaborators, and referrers** who want to see what Jake has built. For them the site is a calling card more than a sales front door.

Both are evaluating; neither is operating a tool. The site is read on desktop and mobile in roughly equal measure (the repo's always-on rule: design both together).

## Product Purpose

Studio Zohdi is the marketing and portfolio site for a one-person software development studio run by Jake Zohdi. It exists to (1) make clear what the studio is and does, (2) send visitors into the body of work, and (3) give them a way to start a conversation. Success is a visitor who understands the studio in one viewport, clicks through to the work, and knows how to get in touch.

## Positioning

**End to end, by one person.** The claim the site must land — settled in the wayfinder session "The statement" (`.scratch/landing-page/issues/01-the-statement.md`) — is that Jake takes software products the whole way: designed, built, shipped, and kept running afterwards. The final clause is the load-bearing half; staying with a product after launch is the part most builders skip.

The studio deliberately does **not** claim a sector. All six commissions cluster tightly in SEC filings, market surveillance, stock promotion, and prediction-market research — but Jake chose to stay open to any kind of work, so no industry is named anywhere on the site.

## Operating Context

Visitors land on `/` (the landing page), click through to `/work` (the project showcase: six projects, giant type list on desktop, stacked list on mobile), and from there into `/projects/<slug>` case studies. Contact is a mailto: `jake@studio-zohdi-llc.com`. Jake's personal site is `https://jakezohdi.dev`.

## Capabilities and Constraints

- SvelteKit 2 / Svelte 5 runes, fully prerendered, deployed to Vercel. No server runtime at request time.
- The landing page is **one fixed screen with no scroll** (settled while charting the wayfinder map).
- The landing page body copy is exactly one sentence: _"I take software products from idea to live and keep them there."_ Plus the studio name and three links: `See the work →` (primary, to `/work`), `More about me ↗` (secondary, external to jakezohdi.dev), and `let's talk` (tertiary, deliberately quieter, mailto). This word budget is a hard constraint, not a target.
- Deliberately unsaid anywhere on the landing page: sector/industry, services list, tech stack, location, availability, rates, team size.
- `/work` gets minimal adjustments only — no redesign.
- Respect `prefers-reduced-motion` everywhere; motion must never block reading or navigation.

## Brand Commitments

- **Name:** Studio Zohdi. Rendered in the logomark as "J" + "Z" glyphs (see `static/J 4.svg`, `scripts/generate-og-image.mjs`).
- **Voice:** first person singular. Studio Zohdi is Jake, working solo, and the site says "I", never "we".
- **Visual identity already in place and binding:** League Spartan display type (bold, condensed, uppercase, tight tracking) over a system-sans body; HSL design tokens in `src/app.css` with a full dark-theme counterpart; a single pink accent (`--pink: 318 78% 53%`) used sparingly; neutrals carry the layout. See `docs/site-spec.md`.
- **Guardrails Jake named for the landing page** (all four are binding): it must not read agency-slick or corporate; motion must not be loud or gimmicky; it must not break visual continuity with `/work` — clicking through must not feel like changing sites; and it must not be so quiet a visitor couldn't describe it an hour later. It needs a real point of view.

## Evidence on Hand

- Six live client-commissioned products, each with a case-study page and published preview media under `static/project-previews/`: FOIA Search, Stock Promotion Tracker, Stop Nasdaq China Fraud, High Ground Research, 8KSearch, and Greffier (in development). All are client work, not Jake's own products.
- No testimonials, client logos, metrics, or press on hand. **Do not fabricate any.**
- Existing motion vocabulary to draw from: a coloured multi-wave panel page transition, a word-by-word text reveal, an SVG title hover effect, and hand-rolled canvas graphics on case-study pages.

## Product Principles

1. **One idea per viewport.** The site says less and means it; copy is cut to the bone and the design carries the rest.
2. **The person is the studio.** Honesty about being one person is the credibility, not a weakness to paper over.
3. **Show, then tell.** The work is the proof; the site's job is to get a visitor to it fast.
4. **Continuity over novelty.** Every page belongs to the same visual world; new surfaces extend it rather than reinvent it.
5. **Motion serves reading.** Premium, subtle, intentional — and degrades cleanly.
