import React from 'react';
import type {CSSProperties} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {MotionPalette} from '../data/projects';
import type {ResolvedProjectScene} from '../lib/assets';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';
import {BrowserFrame, PhoneFrame} from './DeviceFrame';
import {MediaSurface} from './MediaSurface';

type SceneStageProps = {
	domainLabel: string;
	palette: MotionPalette;
	projectName: string;
	scene: ResolvedProjectScene;
	sceneCount: number;
	sceneIndex: number;
	showLockup: boolean;
	transitionDurationInFrames: number;
};

type MotionRecipe = {
	enterX: number;
	enterY: number;
	exitX: number;
	exitY: number;
	enterRotate: number;
	exitRotate: number;
	enterScale: number;
	exitScale: number;
	floatY: number;
	floatRotate: number;
	haloScale: number;
};

const overlayTextStrong = 'rgba(246, 250, 249, 0.96)';
const overlayTextMuted = 'rgba(221, 234, 230, 0.74)';

const getSceneLabelVariant = (scene: ResolvedProjectScene): 'desktop' | 'mobile' | 'detail' | 'flow' => {
	if (scene.mediaType === 'recording') {
		return 'flow';
	}

	return scene.surface === 'mobile' ? 'mobile' : 'desktop';
};

const getMotionRecipe = (scene: ResolvedProjectScene): MotionRecipe => {
	if (scene.surface === 'desktop' && scene.mediaType === 'recording') {
		return {
			enterX: 420,
			enterY: 0,
			exitX: -220,
			exitY: -18,
			enterRotate: 2,
			exitRotate: -1.5,
			enterScale: 0.94,
			exitScale: 1.02,
			floatY: 6,
			floatRotate: 0.35,
			haloScale: 1.2
		};
	}

	if (scene.surface === 'desktop') {
		return {
			enterX: -240,
			enterY: 38,
			exitX: 180,
			exitY: -20,
			enterRotate: -6,
			exitRotate: 3,
			enterScale: 0.92,
			exitScale: 1.03,
			floatY: 10,
			floatRotate: 0.7,
			haloScale: 1.05
		};
	}

	if (scene.mediaType === 'recording') {
		return {
			enterX: -160,
			enterY: 120,
			exitX: 140,
			exitY: -90,
			enterRotate: -10,
			exitRotate: 8,
			enterScale: 0.88,
			exitScale: 1.04,
			floatY: 10,
			floatRotate: 1.1,
			haloScale: 1.08
		};
	}

	return {
		enterX: 210,
		enterY: 90,
		exitX: -180,
		exitY: -50,
		enterRotate: 10,
		exitRotate: -8,
		enterScale: 0.86,
		exitScale: 1.02,
		floatY: 12,
		floatRotate: 1.25,
		haloScale: 1.06
	};
};

const getLayoutStyle = (scene: ResolvedProjectScene, showLockup: boolean): CSSProperties => {
	if (scene.surface === 'desktop' && scene.mediaType === 'recording') {
		return {
			left: '4%',
			top: showLockup ? '18%' : '8%',
			width: '92%',
			height: showLockup ? '66%' : '80%'
		};
	}

	if (scene.surface === 'desktop') {
		return {
			left: showLockup ? '9%' : '8%',
			top: showLockup ? '20%' : '12%',
			width: showLockup ? '58%' : '62%',
			aspectRatio: showLockup ? '1.68 / 1' : '1.72 / 1'
		};
	}

	if (scene.mediaType === 'recording') {
		return {
			left: '34%',
			top: showLockup ? '8%' : '4%',
			width: '32%',
			height: '88%'
		};
	}

	return {
		left: '36%',
		top: showLockup ? '16%' : '8%',
		width: '28%',
		height: '78%'
	};
};

const getLabelCardStyle = (scene: ResolvedProjectScene, showLockup: boolean): CSSProperties => {
	if (scene.surface === 'mobile') {
		return {
			left: '8%',
			bottom: showLockup ? '10%' : '7%'
		};
	}

	return {
		right: '9%',
		bottom: showLockup ? '10%' : '7%'
	};
};

export const SceneStage: React.FC<SceneStageProps> = ({
	domainLabel,
	palette,
	projectName,
	scene,
	sceneCount,
	sceneIndex,
	showLockup,
	transitionDurationInFrames
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const recipe = getMotionRecipe(scene);
	const exitStartFrame = Math.max(0, scene.durationInFrames - transitionDurationInFrames);
	const enterProgress = spring({
		frame,
		fps,
		durationInFrames: transitionDurationInFrames,
		durationRestThreshold: 0.001,
		config: {
			damping: 200,
			stiffness: 240,
			overshootClamping: true
		}
	});
	const exitProgress = spring({
		frame: frame - exitStartFrame,
		fps,
		durationInFrames: transitionDurationInFrames,
		durationRestThreshold: 0.001,
		config: {
			damping: 220,
			stiffness: 260,
			overshootClamping: true
		}
	});
	const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp'
	});
	const idleWave = Math.sin((frame + sceneIndex * 12) / 18);
	const translateX =
		interpolate(enterProgress, [0, 1], [recipe.enterX, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) +
		interpolate(exitProgress, [0, 1], [0, recipe.exitX], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		});
	const translateY =
		interpolate(enterProgress, [0, 1], [recipe.enterY, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) +
		interpolate(exitProgress, [0, 1], [0, recipe.exitY], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) +
		idleWave * recipe.floatY;
	const rotate =
		interpolate(enterProgress, [0, 1], [recipe.enterRotate, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) +
		interpolate(exitProgress, [0, 1], [0, recipe.exitRotate], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) +
		idleWave * recipe.floatRotate;
	const scale =
		interpolate(enterProgress, [0, 1], [recipe.enterScale, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) *
		interpolate(exitProgress, [0, 1], [1, recipe.exitScale], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp'
		}) *
		(1 + Math.sin((frame + sceneIndex * 8) / 26) * 0.006);
	const sceneOpacity = Math.min(1, enterProgress) * exitOpacity;
	const labelVariant = getSceneLabelVariant(scene);
	const layoutStyle = getLayoutStyle(scene, showLockup);
	const labelCardStyle = getLabelCardStyle(scene, showLockup);

	const stageBody = (
		<div style={{position: 'relative', width: '100%', height: '100%'}}>
			<MediaSurface
				asset={scene}
				fit={scene.fit}
				label={scene.label}
				palette={palette}
				projectName={projectName}
				variant={labelVariant}
			/>
			<AbsoluteFill
				style={{
					background:
						scene.surface === 'desktop'
							? 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 32%, rgba(0,0,0,0.08) 100%)'
							: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 26%)'
				}}
			/>
		</div>
	);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: scene.surface === 'desktop' ? '70%' : '36%',
					height: scene.surface === 'desktop' ? '70%' : '80%',
					background: `radial-gradient(circle at center, ${palette.glow}, transparent 66%)`,
					filter: 'blur(24px)',
					transform: `translate(-50%, -50%) scale(${recipe.haloScale})`,
					opacity: sceneOpacity * 0.9
				}}
			/>

			{scene.surface === 'desktop' ? (
				<BrowserFrame
					style={{
						...layoutStyle,
						opacity: sceneOpacity,
						transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})`
					}}
					url={domainLabel}
				>
					{stageBody}
				</BrowserFrame>
			) : (
				<PhoneFrame
					style={{
						...layoutStyle,
						opacity: sceneOpacity,
						transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})`
					}}
				>
					{stageBody}
				</PhoneFrame>
			)}

			<div
				style={{
					position: 'absolute',
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
					padding: '18px 20px',
					borderRadius: 26,
					background: 'rgba(6, 16, 15, 0.48)',
					boxShadow: `0 24px 70px rgba(0, 0, 0, 0.24), inset 0 0 0 1px rgba(255,255,255,0.12)`,
					backdropFilter: 'blur(24px)',
					color: overlayTextStrong,
					opacity: sceneOpacity,
					transform: `translateY(${interpolate(enterProgress, [0, 1], [18, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp'
					})}px)`,
					...labelCardStyle
				}}
			>
				<div
					style={{
						fontFamily: displayFontFamily,
						fontSize: 15,
						fontWeight: 700,
						letterSpacing: '0.1em',
						textTransform: 'uppercase'
					}}
				>
					{scene.label}
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						fontFamily: bodyFontFamily,
						fontSize: 14,
						fontWeight: 600,
						color: overlayTextMuted
					}}
				>
					<span>{scene.surface === 'desktop' ? 'Desktop' : 'Mobile'}</span>
					<span>{scene.mediaType === 'recording' ? 'Recording' : 'Screenshot'}</span>
					<span>
						{sceneIndex + 1}/{sceneCount}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};
