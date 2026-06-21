# Studio Zohdi

Studio Zohdi is a SvelteKit marketing and portfolio website for a freelance web development business. The current focus is building a polished, responsive homepage with tasteful motion, clean theming, and a structure that can grow as real case-study content is added.

## Stack

- SvelteKit 2 with Svelte 5 runes mode
- TypeScript and Vite
- `@sveltejs/adapter-vercel` for deployment
- Prettier, ESLint, and `svelte-check`
- Vitest with browser testing support via Playwright

## Getting started

This repository currently uses a `pnpm-lock.yaml`, so `pnpm` is the recommended package manager.

```sh
pnpm install
pnpm dev
```

## Scripts

```sh
pnpm dev
pnpm check
pnpm lint
pnpm build
pnpm preview
pnpm test
pnpm video:publish foia-search
```

## Project structure

- `src/routes/+layout.svelte`: root layout, global head tags, font loading, favicon, and global CSS import
- `src/routes/+layout.ts`: root page options; current marketing routes are prerendered
- `src/routes/+page.svelte`: homepage shell and featured-project interactions
- `src/app.css`: global design tokens, theme variables, resets, shared utilities
- `src/lib/components/home/`: homepage-specific reusable Svelte components
- `src/lib/data/featured-projects.ts`: centralized featured project content used by desktop and mobile layouts; currently seeded with the live portfolio lineup plus Greffier as an upcoming product
- `src/lib/generated/project-preview-media.ts`: generated map of published desktop preview videos, poster frames, and sources
- `src/lib/utils/theme.ts`: theme resolution, persistence, and DOM application helpers
- `docs/site-spec.md`: living design and implementation reference for brand, layout, and motion decisions
- `.cursor/rules/studio-zohdi-website.mdc`: always-on project rule for future agent threads
- `static/`: public files such as logos, manifest assets, robots, and generated project preview media in `static/project-previews/`

## Working conventions

- Follow `docs/site-spec.md` for palette, typography, motion, and screenshot-fidelity guidance.
- Keep desktop and mobile implementations aligned as sections evolve.
- Prefer centralized data and reusable components over hard-coded one-off markup.
- Use animation with restraint and always respect `prefers-reduced-motion`.
- Add real portfolio assets and links through shared data structures so content swaps do not require page rewrites.

## Deployment

The production target is Vercel through `@sveltejs/adapter-vercel`.

```sh
pnpm build
```

Current marketing routes are safe to prerender, which keeps deployment simple and fast.

## Testing notes

- `pnpm check` runs Svelte compiler and type checks.
- `pnpm lint` runs Prettier and ESLint.
- `pnpm test` depends on Playwright browser binaries. If they are missing locally, install them with:

```sh
pnpm exec playwright install
```
