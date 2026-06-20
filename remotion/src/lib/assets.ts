import {getStaticFiles, type StaticFile} from 'remotion';

export type AssetKind = 'image' | 'video';
export type AssetSlot = 'desktop' | 'mobile' | 'detail' | 'flow';

export type ProjectAsset = {
	kind: AssetKind;
	name: string;
	src: string;
	slot: AssetSlot;
};

export type ProjectAssets = Record<AssetSlot, ProjectAsset | null>;

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg']);
const videoExtensions = new Set(['mp4', 'mov', 'webm', 'm4v']);

const assetNameAliases: Record<AssetSlot, string[]> = {
	desktop: ['desktop', 'browser', 'hero-desktop', 'main'],
	mobile: ['mobile', 'phone', 'hero-mobile', 'app'],
	detail: ['detail', 'supporting', 'crop', 'secondary'],
	flow: ['flow', 'footage', 'demo', 'screenstudio', 'screen-studio']
};

const emptyAssets: ProjectAssets = {
	desktop: null,
	mobile: null,
	detail: null,
	flow: null
};

const normalizePath = (value: string): string => value.replace(/\\/g, '/').toLowerCase();

const getExtension = (value: string): string => {
	const normalized = normalizePath(value);
	const lastDot = normalized.lastIndexOf('.');

	return lastDot === -1 ? '' : normalized.slice(lastDot + 1);
};

const getBaseName = (value: string): string => {
	const normalized = normalizePath(value);
	const lastSlash = normalized.lastIndexOf('/');
	const filename = lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);
	const extension = getExtension(filename);

	return extension ? filename.slice(0, -(extension.length + 1)) : filename;
};

const getAssetKind = (file: StaticFile): AssetKind | null => {
	const extension = getExtension(file.name);

	if (imageExtensions.has(extension)) {
		return 'image';
	}

	if (videoExtensions.has(extension)) {
		return 'video';
	}

	return null;
};

const getAssetScore = (file: StaticFile, slot: AssetSlot): number => {
	const aliases = assetNameAliases[slot];
	const baseName = getBaseName(file.name);
	const exactAliasIndex = aliases.findIndex((alias) => alias === baseName);
	const extension = getExtension(file.name);
	const kind = getAssetKind(file);

	const aliasScore = exactAliasIndex === -1 ? aliases.length + 1 : exactAliasIndex;
	const extensionScore = kind === 'video' ? 0 : extension === 'png' ? 1 : extension === 'webp' ? 2 : 3;

	return aliasScore * 10 + extensionScore;
};

const fileMatchesSlot = (file: StaticFile, slot: AssetSlot): boolean => {
	const aliases = assetNameAliases[slot];
	const baseName = getBaseName(file.name);

	return aliases.some((alias) => {
		return baseName === alias || baseName.startsWith(`${alias}-`) || baseName.startsWith(`${alias}_`);
	});
};

const pickProjectAsset = (files: StaticFile[], projectId: string, slot: AssetSlot): ProjectAsset | null => {
	const projectPrefix = `projects/${projectId}/`;

	const candidates = files
		.filter((file) => normalizePath(file.name).startsWith(projectPrefix))
		.filter((file) => getAssetKind(file) !== null)
		.filter((file) => fileMatchesSlot(file, slot))
		.sort((left, right) => getAssetScore(left, slot) - getAssetScore(right, slot));

	const file = candidates[0];
	const kind = file ? getAssetKind(file) : null;

	if (!file || !kind) {
		return null;
	}

	return {
		kind,
		name: file.name,
		src: file.src,
		slot
	};
};

export const resolveProjectAssets = (projectId: string): ProjectAssets => {
	const files = getStaticFiles();

	if (files.length === 0) {
		return emptyAssets;
	}

	return {
		desktop: pickProjectAsset(files, projectId, 'desktop'),
		mobile: pickProjectAsset(files, projectId, 'mobile'),
		detail: pickProjectAsset(files, projectId, 'detail'),
		flow: pickProjectAsset(files, projectId, 'flow')
	};
};

export const hasAnyProjectAsset = (assets: ProjectAssets): boolean => {
	return Object.values(assets).some(Boolean);
};
