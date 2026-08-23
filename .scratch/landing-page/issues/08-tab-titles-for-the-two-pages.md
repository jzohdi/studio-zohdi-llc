# Tab titles for the two pages

Type: grilling
Status: resolved
Blocked by: —

## Question

`/` and `/work` both emit `SITE.defaultTitle` — "Studio Zohdi | Software Development Studio" — and the same organization/website JSON-LD. Should the two tabs be distinguishable, and if so what does `/work`'s title say?

This is the on-screen part of page identity: what a visitor sees in the tab bar and in history. Canonical URLs, Open Graph cards, and schema changes remain out of scope for this map (production hardening); the one thing in scope is the visible `<title>`, which is one string in `src/routes/work/+page.svelte`'s `<Seo>` call.

Things this needs to resolve:

- Whether it matters enough to change — two identical tab titles is a small, common sin.
- If it does: the string. Candidates follow the existing pattern `"<page> | Studio Zohdi"`: `Work | Studio Zohdi`, `Recent Projects | Studio Zohdi` (it's what the page's own eyebrow says), or leave the landing page as the only holder of the default title.
- Whether the meta description on `/work` should move off `SITE.description` at the same time (it's one more string in the same call). Its current text names categories no project matches — but that belongs to the out-of-scope SEO pass unless Jake wants it fixed while the file is open.

## Answer

**`/work`'s tab now reads `Work | Studio Zohdi`.** The landing page keeps the default title, `Studio Zohdi | Software Development Studio`, so the two tabs are distinguishable and the site follows one pattern throughout: the landing page carries the studio's full title; every other page is `<page> | Studio Zohdi`, exactly as the project pages already do (`FOIA SEARCH | Studio Zohdi`). Jake chose `Work` over `Recent Projects` because it matches the route and the link that leads there.

One-line change in `src/routes/work/+page.svelte`: `title={\`Work | ${SITE.titleSuffix}\`}`. Verified in the prerendered output — `/`, `/work`, and a project page each carry their own title. Build, svelte-check, eslint, prettier clean.

**The meta description was deliberately left alone.** `/work` still emits `SITE.description`, whose categories (commerce, creative, energy) match no project; Jake chose to fix it once, for every page that uses it, in the production-hardening SEO pass already recorded as out of scope on the map — rather than patch one page here.
