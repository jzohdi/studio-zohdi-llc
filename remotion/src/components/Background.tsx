import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {MotionPalette} from '../data/projects';

type BackgroundProps = {
	palette: MotionPalette;
};

const grainSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="220" height="220" filter="url(#noise)" opacity="1"/>
</svg>
`;

const grainTexture = `url("data:image/svg+xml,${encodeURIComponent(grainSvg)}")`;

export const Background: React.FC<BackgroundProps> = ({palette}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const phase = (frame / durationInFrames) * Math.PI * 2;
	const driftX = Math.sin(phase * 0.7) * 5.2;
	const driftY = Math.cos(phase * 0.55) * 5.8;
	const glowOpacity = interpolate(Math.sin(phase * 0.9), [-1, 1], [0.16, 0.28]);
	const flowX = Math.sin(phase * 0.42) * 12;
	const flowY = Math.cos(phase * 0.36) * 10;

	return (
		<AbsoluteFill
			style={{
				background:
					'linear-gradient(145deg, rgb(6 14 14) 0%, rgb(10 26 24) 38%, rgb(5 14 14) 100%)',
				overflow: 'hidden'
			}}
		>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 18% 20%, ${palette.highlight}, transparent 40%)`,
					filter: 'blur(14px)',
					opacity: glowOpacity,
					transform: `translate(${driftX}%, ${driftY}%) scale(1.08)`
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						`radial-gradient(circle at 78% 16%, ${palette.backgroundStart}, transparent 28%), radial-gradient(circle at 70% 68%, ${palette.backgroundEnd}, transparent 34%)`,
					opacity: 0.08,
					filter: 'blur(22px)',
					transform: `translate(${-driftX * 0.7}%, ${-driftY * 0.5}%) scale(1.02)`
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(120deg, transparent 16%, rgba(255,255,255,0.09) 48%, transparent 76%)',
					filter: 'blur(56px)',
					mixBlendMode: 'screen',
					opacity: 0.24,
					transform: `translate(${flowX}%, ${flowY}%) rotate(-8deg) scale(1.34)`
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: grainTexture,
					backgroundPosition: `${frame * -0.9}px ${frame * -0.45}px`,
					backgroundSize: '220px 220px',
					mixBlendMode: 'soft-light',
					opacity: 0.18
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: grainTexture,
					backgroundPosition: `${frame * 0.28}px ${frame * -0.18}px`,
					backgroundSize: '130px 130px',
					mixBlendMode: 'overlay',
					opacity: 0.08
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(circle at center, transparent 42%, rgba(0,0,0,0.36) 100%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 22%, rgba(0,0,0,0.16) 100%)'
				}}
			/>
		</AbsoluteFill>
	);
};
