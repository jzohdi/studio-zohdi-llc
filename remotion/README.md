# Studio Zohdi Remotion

Reusable Remotion compositions for project preview videos that can be rendered back into the main site as MP4 assets.

## What this gives you

- One `ProjectPreview-*` composition per project
- One `PortfolioOverview` composition that chains the full lineup together
- A manifest-driven asset system in `remotion/src/data/project-preview-manifest.json`
- Any number of desktop screenshots, mobile screenshots, desktop recordings, mobile recordings, and text frames per project
- Automatic scene sequencing with simple slide/fade transitions
- Palette overrides, per-project timing defaults, and homepage mobile poster selection

## Commands

From the repo root:

```bash
npm run video:dev
npm run video:compositions
npm run video:render -- PortfolioOverview out/portfolio-overview.mp4
npm run video:render -- ProjectPreview-foia-search out/foia-search.mp4
pnpm carousel:publish foia-search
```

Inside `remotion/` directly:

```bash
npm run dev
npm run compositions
npm run render -- ProjectPreview-foia-search out/foia-search.mp4
npm run typecheck
```

## Asset placement

Put exported screenshots and Screen Studio clips anywhere under:

```txt
remotion/public/projects/<project-id>/
```

Example:

```txt
remotion/public/projects/foia-search/desktop/home-hero.png
remotion/public/projects/foia-search/mobile/search-results.png
remotion/public/projects/foia-search/desktop/video/search-demo.mp4
```

## Manifest configuration

Edit `remotion/src/data/project-preview-manifest.json`.

Example shape:

```ts
export const projectAssetManifest = {
	foiaSearch: {
		projectId: 'foia-search',
		palette: {
			highlight: '#2fb879',
			glow: 'rgba(47, 184, 121, 0.28)'
		},
		defaults: {
			screenshotDurationInSeconds: 1.8,
			recordingDurationInSeconds: 3.2,
			transitionDurationInSeconds: 0.6
		},
		desktopScreenshots: [
			'projects/foia-search/desktop/home-hero.png',
			{ path: 'projects/foia-search/desktop/results.png', durationInSeconds: 2.1 }
		],
		desktopScreenRecordings: [
			{ path: 'projects/foia-search/desktop/video/search-demo.mp4', durationInSeconds: 3.5 }
		],
		mobileScreenshots: [
			'projects/foia-search/mobile/home.png',
			'projects/foia-search/mobile/results.png'
		],
		mobileScreenRecordings: [
			{ path: 'projects/foia-search/mobile/video/mobile-search.mp4', durationInSeconds: 2.8 }
		],
		textFrames: [{ text: 'Instantly Find B7A\nRequests', duration: 1.6 }]
	}
} satisfies Record<string, ProjectAssetConfig>;
```

## Timeline behavior

By default, scenes are auto-ordered in this pattern and repeated until assets run out:

1. `desktopScreenshots`
2. `mobileScreenshots`
3. `desktopScreenRecordings`
4. `mobileScreenRecordings`
5. `textFrames`

If you want exact manual ordering, add `timeline`:

```ts
timeline: [
	{ collection: 'textFrames', index: 0 },
	{ collection: 'desktopScreenshots', index: 0 },
	{ collection: 'mobileScreenshots', index: 0 },
	{ collection: 'desktopScreenRecordings', index: 0 },
	{ collection: 'desktopScreenshots', index: 1 }
];
```

`textFrames` are most useful with an explicit `timeline` so you can place them exactly where you want them.

## Asset entry options

Strings are shorthand paths. Object entries support extra control:

```ts
{
  path: 'projects/foia-search/desktop/video/search-demo.mp4',
  durationInSeconds: 3.5,
  trimBeforeInSeconds: 0.5,
  fit: 'cover',
  label: 'Results walkthrough'
}
```

- `durationInSeconds`: how long the scene stays on screen
- `trimBeforeInSeconds`: skip the beginning of a recording
- `fit`: `cover` or `contain`
- `label`: override the generated scene label

Text frames use a dedicated shape:

```ts
{
  text: 'Instantly Find B7A\nRequests',
  duration: 1.6
}
```

- `text`: the full-screen bold text to render; newline characters are respected
- `duration`: how long the text frame stays on screen, in seconds

## Suggested capture set

For each project, aim for:

1. 2-4 strong desktop screenshots
2. 2-4 strong mobile screenshots
3. 1-2 short desktop recordings from Screen Studio
4. 0-2 short mobile recordings if the mobile flow matters

The best results usually come from mixing stills and short motion clips rather than relying on one long recording.

## Suggested Screen Studio settings

- Keep clips short, ideally 3-6 seconds each
- Capture one intentional interaction per clip
- Prefer smooth cursor motion and restrained zoom
- Export muted footage because Remotion renders these previews without audio
- Record at high resolution so the framed crop still feels premium

## Homepage carousel export

To export homepage carousel assets from the same manifest without rendering a video:

```bash
pnpm carousel:publish foia-search
```

That flow:

1. reads `remotion/src/data/project-preview-manifest.json`
2. resolves the same ordered scenes used by the Remotion compositions
3. copies the referenced screenshots and recordings into `static/project-previews/<project-id>/carousel/assets/`
4. detects the copied media dimensions so the homepage mobile phone mock can size itself to each asset
5. writes `src/lib/generated/project-preview-carousel.ts` for the Svelte homepage

Desktop homepage previews read that generated scene manifest and render a native HTML carousel. Mobile previews use the separately configured `homepage.mobilePoster` image.

Example:

```json
{
	"foiaSearch": {
		"projectId": "foia-search",
		"homepage": {
			"mobilePoster": {
				"collection": "mobileScreenshots",
				"index": 0
			}
		}
	}
}
```

### Editing Carousel Output

When you want to change the homepage carousel for a project, use this workflow:

1. Add or replace the source asset under `remotion/public/projects/<project-id>/`
2. Update the matching entry in `remotion/src/data/project-preview-manifest.json`
3. If the homepage slide order should change, update the project's `timeline`
4. If the mobile homepage poster should change, update `homepage.mobilePoster`
5. Run `pnpm carousel:publish <project-id>`

Important notes:

- `mobileScreenshots`, `mobileScreenRecordings`, `desktopScreenshots`, and `desktopScreenRecordings` are just named collections. The actual homepage order comes from `timeline` when it is present.
- You do not need to hand-tune the mobile phone mock ratio per slide. `pnpm carousel:publish <project-id>` detects image and video dimensions and exports the aspect ratio automatically.
- `src/lib/generated/project-preview-carousel.ts` is generated. Do not edit it by hand.
- If you want the Remotion video composition to match the same change, also rerender or republish the video after updating the manifest.

Example: replace the last FOIA homepage carousel slide with a new mobile recording:

```json
{
	"mobileScreenRecordings": [
		{
			"path": "projects/foia-search/mobile_recording_1.mp4",
			"durationInSeconds": 4.2,
			"fit": "contain"
		}
	],
	"timeline": [
		{ "collection": "textFrames", "index": 0 },
		{ "collection": "mobileScreenshots", "index": 0 },
		{ "collection": "textFrames", "index": 1 },
		{ "collection": "desktopScreenRecordings", "index": 0 },
		{ "collection": "textFrames", "index": 2 },
		{ "collection": "mobileScreenRecordings", "index": 0 }
	]
}
```

Then run:

```bash
pnpm carousel:publish foia-search
```

## Rendering back into the site

Once you like a composition, publish it through the root workspace script:

```bash
pnpm video:publish foia-search
```

That flow:

1. renders `ProjectPreview-foia-search` to `remotion/out/foia-search.mp4`
2. creates an optimized homepage MP4 at `static/project-previews/foia-search/preview.mp4`
3. creates a WebM alternate at `static/project-previews/foia-search/preview.webm`
4. captures the first frame as `static/project-previews/foia-search/poster.jpg`
5. refreshes `src/lib/generated/project-preview-media.ts` so the Svelte homepage can pick it up

If you already have a fresh render in `remotion/out`, skip the render step:

```bash
pnpm video:publish foia-search --skip-render
```
