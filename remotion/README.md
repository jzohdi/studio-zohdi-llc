# Studio Zohdi Remotion

Reusable Remotion compositions for project preview videos that can be embedded back into the main site as rendered assets.

## What this gives you

- One ambient `ProjectPreview-*` composition per project for site-ready hero loops
- One `PortfolioOverview` composition that cycles through the whole lineup
- Automatic asset discovery from `remotion/public/projects/<project-id>/`
- Graceful placeholders when no real screenshots or footage have been added yet

## Commands

From the repo root:

```bash
npm run video:dev
npm run video:compositions
npm run video:render -- PortfolioOverview out/portfolio-overview.mp4
npm run video:render -- ProjectPreview-foia-search out/foia-search.mp4
```

You can also work directly inside `remotion/`:

```bash
npm run dev
npm run compositions
npm run render -- ProjectPreview-foia-search out/foia-search.mp4
npm run typecheck
```

## Asset workflow

For each project, create a folder:

```txt
remotion/public/projects/<project-id>/
```

The composition automatically looks for these conventional filenames:

- `desktop.png` or `desktop.mp4`
- `mobile.png` or `mobile.mp4`
- `detail.png`
- `flow.mp4`

Alternate aliases are also supported:

- `browser`, `hero-desktop`, `main`
- `phone`, `hero-mobile`, `app`
- `supporting`, `crop`, `secondary`
- `footage`, `demo`, `screenstudio`, `screen-studio`

## Recommended capture set

For the best result, aim for this per project:

1. `desktop.png`: the strongest full desktop screen
2. `mobile.png`: a portrait mobile adaptation or responsive shot
3. `detail.png`: a tighter crop of a strong visual area
4. `flow.mp4`: a 4-8 second Screen Studio clip with subtle cursor motion

If you only have screenshots, the composition still works. If you add `flow.mp4`, it becomes the main browser motion surface automatically.

## Suggested Screen Studio settings

- Keep clips short and intentional, ideally one clean interaction
- Prefer gentle cursor motion over frantic navigation
- Hide irrelevant browser chrome when possible
- Export muted footage; the Remotion compositions render with audio disabled
- Capture at high resolution so the crop still looks sharp inside the device frame

## Rendering back into the site

Once you are happy with a composition, render to the main site's static assets folder. Example:

```bash
npm run video:render -- ProjectPreview-foia-search ../static/project-previews/foia-search.mp4
```

That gives you a ready-to-embed asset for the homepage or future case studies.
