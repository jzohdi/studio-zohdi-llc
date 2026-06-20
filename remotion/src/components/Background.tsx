import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {MotionPalette} from '../data/projects';

type BackgroundProps = {
	palette: MotionPalette;
};

export const Background: React.FC<BackgroundProps> = ({palette}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const phase = (frame / durationInFrames) * Math.PI * 2;
	const driftX = Math.sin(phase) * 3.4;
	const driftY = Math.cos(phase * 0.8) * 3.8;
	const glowOpacity = interpolate(Math.sin(phase * 0.9), [-1, 1], [0.5, 0.85]);

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(140deg, ${palette.backgroundStart} 0%, ${palette.backgroundEnd} 100%)`,
				overflow: 'hidden'
			}}
		>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 18% 20%, ${palette.glow}, transparent 42%)`,
					filter: 'blur(8px)',
					opacity: glowOpacity,
					transform: `translate(${driftX}%, ${driftY}%) scale(1.08)`
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(circle at 78% 16%, rgba(255,255,255,0.32), transparent 28%), radial-gradient(circle at 70% 68%, rgba(255,255,255,0.18), transparent 30%)',
					opacity: 0.9,
					transform: `translate(${-driftX * 0.7}%, ${-driftY * 0.5}%) scale(1.02)`
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage:
						'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
					backgroundPosition: `${frame * -0.18}px ${frame * -0.12}px, ${frame * -0.22}px ${frame * -0.16}px`,
					backgroundSize: '160px 160px',
					maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.14), rgba(0,0,0,0.85))',
					mixBlendMode: 'soft-light',
					opacity: 0.44
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.04) 24%, rgba(0,0,0,0.08) 100%)'
				}}
			/>
		</AbsoluteFill>
	);
};
