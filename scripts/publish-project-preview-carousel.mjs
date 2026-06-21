import { execFile } from 'node:child_process';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));
const remotionPublicDir = path.join(workspaceRoot, 'remotion', 'public');
const remotionManifestPath = path.join(
	workspaceRoot,
	'remotion',
	'src',
	'data',
	'project-preview-manifest.json'
);
const staticPreviewsDir = path.join(workspaceRoot, 'static', 'project-previews');
const generatedCachePath = path.join(
	workspaceRoot,
	'src',
	'lib',
	'generated',
	'project-preview-carousel.manifest.json'
);
const generatedManifestPath = path.join(
	workspaceRoot,
	'src',
	'lib',
	'generated',
	'project-preview-carousel.ts'
);
const execFileAsync = promisify(execFile);

const defaultTimings = {
	screenshotDurationInSeconds: 1.8,
	recordingDurationInSeconds: 3.2
};

const collectionOrder = [
	'desktopScreenshots',
	'mobileScreenshots',
	'desktopScreenRecordings',
	'mobileScreenRecordings',
	'textFrames'
];

const sceneLabels = {
	desktopScreenshots: 'Desktop Screenshot',
	desktopScreenRecordings: 'Desktop Recording',
	mobileScreenshots: 'Mobile Screenshot',
	mobileScreenRecordings: 'Mobile Recording',
	textFrames: 'Text Frame'
};

const mimeTypes = {
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.m4v': 'video/mp4',
	'.mov': 'video/quicktime',
	'.mp4': 'video/mp4',
	'.png': 'image/png',
	'.webm': 'video/webm',
	'.webp': 'image/webp'
};

const args = process.argv.slice(2);
const projectIds = args.filter((arg) => !arg.startsWith('--'));

if (projectIds.length === 0) {
	console.error(
		'Usage: node scripts/publish-project-preview-carousel.mjs <project-id> [project-id...]'
	);
	process.exit(1);
}

const sourceManifest = await readJsonFile(remotionManifestPath);
const generatedCache = await readJsonFile(generatedCachePath, {});

await mkdir(staticPreviewsDir, { recursive: true });
await mkdir(path.dirname(generatedCachePath), { recursive: true });

for (const projectId of projectIds) {
	const entry = await publishProjectCarousel(projectId, sourceManifest);

	if (entry) {
		generatedCache[projectId] = entry;
	} else {
		delete generatedCache[projectId];
	}
}

const sortedCache = Object.fromEntries(
	Object.entries(generatedCache).sort(([left], [right]) => left.localeCompare(right))
);

await writeFile(generatedCachePath, `${JSON.stringify(sortedCache, null, 2)}\n`);
await writeGeneratedManifest(sortedCache);

console.info(`Updated carousel manifest at ${toWorkspaceRelativePath(generatedManifestPath)}`);

async function publishProjectCarousel(projectId, manifest) {
	const config =
		Object.values(manifest).find((entry) => {
			return entry.projectId === projectId;
		}) ?? null;

	if (!config) {
		throw new Error(`No project preview manifest entry found for "${projectId}".`);
	}

	const timings = {
		screenshotDurationInSeconds:
			config.defaults?.screenshotDurationInSeconds ?? defaultTimings.screenshotDurationInSeconds,
		recordingDurationInSeconds:
			config.defaults?.recordingDurationInSeconds ?? defaultTimings.recordingDurationInSeconds
	};

	const collections = {
		desktopScreenshots: (config.desktopScreenshots ?? []).map((asset, index) =>
			buildResolvedScene('desktopScreenshots', index, asset, timings)
		),
		desktopScreenRecordings: (config.desktopScreenRecordings ?? []).map((asset, index) =>
			buildResolvedScene('desktopScreenRecordings', index, asset, timings)
		),
		mobileScreenshots: (config.mobileScreenshots ?? []).map((asset, index) =>
			buildResolvedScene('mobileScreenshots', index, asset, timings)
		),
		mobileScreenRecordings: (config.mobileScreenRecordings ?? []).map((asset, index) =>
			buildResolvedScene('mobileScreenRecordings', index, asset, timings)
		),
		textFrames: (config.textFrames ?? config.textFrame ?? []).map((frame, index) =>
			buildResolvedTextScene(index, frame)
		)
	};

	const timelineReferences =
		config.timeline?.length > 0 ? config.timeline : buildAutoTimeline(collections);
	const scenes = timelineReferences
		.map((reference) => collections[reference.collection]?.[reference.index] ?? null)
		.filter(Boolean);
	const mobilePosterReference = config.homepage?.mobilePoster ?? null;
	const mobilePosterScene = mobilePosterReference
		? (collections[mobilePosterReference.collection]?.[mobilePosterReference.index] ?? null)
		: null;

	if (scenes.length === 0 && !mobilePosterScene) {
		console.info(`Skipping ${projectId}; no carousel scenes or mobile poster configured.`);
		return null;
	}

	const carouselDir = path.join(staticPreviewsDir, projectId, 'carousel');
	const carouselAssetsDir = path.join(carouselDir, 'assets');

	await mkdir(carouselAssetsDir, { recursive: true });

	const copiedAssets = new Map();
	const exportedScenes = [];

	for (const scene of scenes) {
		if (!scene.path) {
			exportedScenes.push({
				id: scene.id,
				kind: scene.kind,
				label: scene.label,
				text: scene.text,
				fit: scene.fit,
				surface: scene.surface,
				mediaType: scene.mediaType,
				durationInMs: scene.durationInMs,
				source: null
			});
			continue;
		}

		const source = await copyProjectAsset({
			normalizedPath: scene.path,
			projectId,
			carouselAssetsDir,
			copiedAssets
		});

		exportedScenes.push({
			id: scene.id,
			kind: scene.kind,
			label: scene.label,
			text: scene.text,
			fit: scene.fit,
			surface: scene.surface,
			mediaType: scene.mediaType,
			durationInMs: scene.durationInMs,
			source
		});
	}

	const mobilePoster = mobilePosterScene?.path
		? {
				label: mobilePosterScene.label,
				fit: mobilePosterScene.fit,
				...(await copyProjectAsset({
					normalizedPath: mobilePosterScene.path,
					projectId,
					carouselAssetsDir,
					copiedAssets
				}))
			}
		: null;

	console.info(`Published carousel assets to ${toWorkspaceRelativePath(carouselDir)}`);

	return {
		mobilePoster,
		scenes: exportedScenes
	};
}

async function writeGeneratedManifest(manifest) {
	const manifestSource = [
		'export type ProjectPreviewCarouselSource = {',
		'\tpath: string;',
		'\ttype: string;',
		'\twidth: number | null;',
		'\theight: number | null;',
		'\taspectRatio: number | null;',
		'};',
		'',
		"export type ProjectPreviewCarouselKind = 'image' | 'video' | 'text';",
		"export type ProjectPreviewCarouselFit = 'cover' | 'contain';",
		"export type ProjectPreviewCarouselSurface = 'desktop' | 'mobile' | 'text';",
		"export type ProjectPreviewCarouselMediaType = 'screenshot' | 'recording' | 'text';",
		'',
		'export type ProjectPreviewCarouselScene = {',
		'\tid: string;',
		'\tkind: ProjectPreviewCarouselKind;',
		'\tlabel: string;',
		'\ttext: string | null;',
		'\tfit: ProjectPreviewCarouselFit;',
		'\tsurface: ProjectPreviewCarouselSurface;',
		'\tmediaType: ProjectPreviewCarouselMediaType;',
		'\tdurationInMs: number;',
		'\tsource: ProjectPreviewCarouselSource | null;',
		'};',
		'',
		'export type ProjectPreviewMobilePoster = {',
		'\tpath: string;',
		'\ttype: string;',
		'\twidth: number | null;',
		'\theight: number | null;',
		'\taspectRatio: number | null;',
		'\tfit: ProjectPreviewCarouselFit;',
		'\tlabel: string;',
		'};',
		'',
		'export type ProjectPreviewCarouselAsset = {',
		'\tmobilePoster: ProjectPreviewMobilePoster | null;',
		'\tscenes: ProjectPreviewCarouselScene[];',
		'};',
		'',
		'// Generated by scripts/publish-project-preview-carousel.mjs',
		`export const projectPreviewCarousel: Record<string, ProjectPreviewCarouselAsset> = ${JSON.stringify(manifest, null, 2)};`,
		'',
		'export function getProjectPreviewCarousel(projectId: string): ProjectPreviewCarouselAsset | null {',
		'\treturn projectPreviewCarousel[projectId] ?? null;',
		'}',
		''
	].join('\n');

	await writeFile(generatedManifestPath, manifestSource);
}

function buildResolvedScene(collection, index, input, defaults) {
	const assetObject = toAssetObject(input);
	const mediaType = getCollectionMediaType(collection);

	return {
		id: `${collection}-${index}`,
		kind: mediaType === 'recording' ? 'video' : 'image',
		path: normalizeAssetPath(assetObject.path),
		label: createSceneLabel(collection, index, assetObject.label),
		text: null,
		surface: getCollectionSurface(collection),
		mediaType,
		fit: assetObject.fit ?? 'cover',
		durationInMs: toMilliseconds(
			assetObject.durationInSeconds ??
				(mediaType === 'recording'
					? defaults.recordingDurationInSeconds
					: defaults.screenshotDurationInSeconds)
		)
	};
}

function buildResolvedTextScene(index, input) {
	return {
		id: `textFrames-${index}`,
		kind: 'text',
		path: null,
		label: createSceneLabel('textFrames', index),
		text: input.text,
		surface: 'text',
		mediaType: 'text',
		fit: 'contain',
		durationInMs: toMilliseconds(input.duration)
	};
}

function buildAutoTimeline(collections) {
	const references = [];
	const maxLength = Math.max(
		...collectionOrder.map((collection) => collections[collection].length),
		0
	);

	for (let index = 0; index < maxLength; index += 1) {
		for (const collection of collectionOrder) {
			if (collections[collection][index]) {
				references.push({ collection, index });
			}
		}
	}

	return references;
}

function normalizeAssetPath(value) {
	const normalized = value
		.replace(/\\/g, '/')
		.trim()
		.replace(/^\.?\//, '');

	return normalized.startsWith('http://') || normalized.startsWith('https://')
		? normalized
		: normalized.replace(/^\/+/, '');
}

function createSceneLabel(collection, index, customLabel) {
	return customLabel ?? `${sceneLabels[collection]} ${String(index + 1).padStart(2, '0')}`;
}

function toAssetObject(input) {
	return typeof input === 'string' ? { path: input } : input;
}

function getCollectionSurface(collection) {
	if (collection === 'textFrames') {
		return 'text';
	}

	return collection.startsWith('desktop') ? 'desktop' : 'mobile';
}

function getCollectionMediaType(collection) {
	if (collection === 'textFrames') {
		return 'text';
	}

	return collection.includes('Recordings') ? 'recording' : 'screenshot';
}

function toMilliseconds(seconds) {
	return Math.max(1, Math.round(seconds * 1000));
}

async function copyProjectAsset({ normalizedPath, projectId, carouselAssetsDir, copiedAssets }) {
	if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
		throw new Error(
			`Remote asset "${normalizedPath}" cannot be exported for the homepage carousel. Use files inside remotion/public/projects/${projectId}/ instead.`
		);
	}

	if (copiedAssets.has(normalizedPath)) {
		return copiedAssets.get(normalizedPath);
	}

	const projectPrefix = `projects/${projectId}/`;

	if (!normalizedPath.startsWith(projectPrefix)) {
		throw new Error(
			`Asset "${normalizedPath}" is outside the "${projectPrefix}" source-of-truth folder for ${projectId}.`
		);
	}

	const relativeWithinProject = normalizedPath.slice(projectPrefix.length);
	const sourceFilePath = path.join(remotionPublicDir, normalizedPath);
	const outputFilePath = path.join(carouselAssetsDir, relativeWithinProject);

	await assertFileExists(
		sourceFilePath,
		`Missing source asset at ${toWorkspaceRelativePath(sourceFilePath)}`
	);

	await mkdir(path.dirname(outputFilePath), { recursive: true });
	await copyFile(sourceFilePath, outputFilePath);
	const mimeType = getMimeType(outputFilePath);
	const dimensions = await getMediaDimensions(sourceFilePath, mimeType);

	const assetReference = {
		path: toPublicAssetPath(
			path.join('project-previews', projectId, 'carousel', 'assets', relativeWithinProject)
		),
		type: mimeType,
		width: dimensions?.width ?? null,
		height: dimensions?.height ?? null,
		aspectRatio: dimensions?.aspectRatio ?? null
	};

	copiedAssets.set(normalizedPath, assetReference);

	return assetReference;
}

function getMimeType(filePath) {
	const extension = path.extname(filePath).toLowerCase();
	const mimeType = mimeTypes[extension];

	if (!mimeType) {
		throw new Error(`Unsupported carousel asset extension "${extension}" for ${filePath}`);
	}

	return mimeType;
}

async function getMediaDimensions(filePath, mimeType) {
	if (mimeType.startsWith('image/')) {
		return getImageDimensions(filePath);
	}

	if (mimeType.startsWith('video/')) {
		return getVideoDimensions(filePath);
	}

	return null;
}

async function getImageDimensions(filePath) {
	try {
		const { stdout } = await execFileAsync('sips', [
			'-g',
			'pixelWidth',
			'-g',
			'pixelHeight',
			filePath
		]);
		const widthMatch = stdout.match(/pixelWidth:\s*(\d+)/);
		const heightMatch = stdout.match(/pixelHeight:\s*(\d+)/);
		const width = widthMatch ? Number(widthMatch[1]) : null;
		const height = heightMatch ? Number(heightMatch[1]) : null;

		if (!width || !height) {
			return null;
		}

		return {
			width,
			height,
			aspectRatio: width / height
		};
	} catch (error) {
		console.warn(
			`Warning: unable to detect image dimensions for ${toWorkspaceRelativePath(filePath)} (${getErrorMessage(error)})`
		);
		return null;
	}
}

async function getVideoDimensions(filePath) {
	try {
		const { stdout } = await execFileAsync('ffprobe', [
			'-v',
			'error',
			'-select_streams',
			'v:0',
			'-show_entries',
			'stream=width,height',
			'-of',
			'json',
			filePath
		]);
		const parsed = JSON.parse(stdout);
		const stream = parsed.streams?.[0] ?? null;
		const width = typeof stream?.width === 'number' ? stream.width : null;
		const height = typeof stream?.height === 'number' ? stream.height : null;

		if (!width || !height) {
			return null;
		}

		return {
			width,
			height,
			aspectRatio: width / height
		};
	} catch (error) {
		console.warn(
			`Warning: unable to detect video dimensions for ${toWorkspaceRelativePath(filePath)} (${getErrorMessage(error)})`
		);
		return null;
	}
}

async function assertFileExists(filePath, message) {
	if (await fileExists(filePath)) {
		return;
	}

	throw new Error(message);
}

async function fileExists(filePath) {
	try {
		await access(filePath);
		return true;
	} catch (error) {
		if (isMissingFileError(error)) {
			return false;
		}

		throw error;
	}
}

async function readJsonFile(filePath, fallbackValue = null) {
	try {
		const fileContents = await readFile(filePath, 'utf8');
		return JSON.parse(fileContents);
	} catch (error) {
		if (isMissingFileError(error) && fallbackValue !== null) {
			return fallbackValue;
		}

		throw error;
	}
}

function toPublicAssetPath(relativePath) {
	return `/${relativePath.split(path.sep).join('/')}`;
}

function toWorkspaceRelativePath(targetPath) {
	return path.relative(workspaceRoot, targetPath) || '.';
}

function isMissingFileError(error) {
	return Boolean(error) && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
}

function getErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
