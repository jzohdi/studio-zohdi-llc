import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo} from 'remotion';
import type {MotionPalette} from '../data/projects';
import type {ProjectAsset} from '../lib/assets';
import {PlaceholderSurface} from './PlaceholderSurface';

type MediaSurfaceProps = {
	asset: ProjectAsset | null;
	fit?: 'cover' | 'contain';
	label: string;
	palette: MotionPalette;
	projectName: string;
	variant: 'desktop' | 'mobile' | 'detail' | 'flow';
};

export const MediaSurface: React.FC<MediaSurfaceProps> = ({
	asset,
	fit = 'cover',
	label,
	palette,
	projectName,
	variant
}) => {
	if (!asset) {
		return (
			<PlaceholderSurface
				label={label}
				palette={palette}
				projectName={projectName}
				variant={variant}
			/>
		);
	}

	const commonStyle = {
		width: '100%',
		height: '100%',
		objectFit: fit
	} as const;

	return (
		<AbsoluteFill>
			{asset.kind === 'video' ? (
				<OffthreadVideo src={asset.src} style={commonStyle} volume={0} />
			) : (
				<Img src={asset.src} style={commonStyle} />
			)}
		</AbsoluteFill>
	);
};
