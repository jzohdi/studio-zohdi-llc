import React from 'react';
import type {CSSProperties} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {MotionPalette} from '../data/projects';
import type {ResolvedProjectScene} from '../lib/assets';
import {displayFontFamily} from '../lib/fonts';
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
	shouldAnimateIn: boolean;
	shouldAnimateOut: boolean;
	transitionDurationInFrames: number;
};

type SceneLayoutMetrics = {
	left: number;
	top: number;
	width: number;
	height: number;
	glowWidth: number;
	glowHeight: number;
	glowOpacity: number;
};

const overlayTextStrong = 'rgba(248, 251, 250, 0.98)';
const clampedInterpolation = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const
};
const getOffscreenMargin = (videoWidth: number): number => {
	return Math.max(160, Math.round(videoWidth * 0.06));
};

const getSceneLabelVariant = (scene: ResolvedProjectScene): 'desktop' | 'mobile' | 'detail' | 'flow' => {
	if (scene.mediaType === 'recording') {
		return 'flow';
	}

	return scene.surface === 'mobile' ? 'mobile' : 'desktop';
};

const getHeadlineLayout = (showLockup: boolean): CSSProperties => {
	return {
		left: '4.5%',
		top: showLockup ? '5.5%' : '4.5%',
		width: '42%',
		alignItems: 'flex-start',
		textAlign: 'left'
	};
};

const getHeadlineFontSize = (label: string): number => {
	if (label.length >= 34) {
		return 74;
	}

	if (label.length >= 24) {
		return 84;
	}

	return 96;
};

const getSceneLayoutMetrics = (
	scene: ResolvedProjectScene,
	showLockup: boolean,
	videoWidth: number,
	videoHeight: number
): SceneLayoutMetrics => {
	const centerX = videoWidth / 2;
	const centerY = videoHeight * (showLockup ? 0.54 : 0.5);

	if (scene.surface === 'desktop' && scene.mediaType === 'recording') {
		const width = videoWidth * (showLockup ? 0.72 : 0.78);
		const aspectRatio = showLockup ? 1.72 : 1.78;
		const height = width / aspectRatio;

		return {
			left: centerX - width / 2,
			top: centerY - height / 2,
			width,
			height,
			glowWidth: width * 1.18,
			glowHeight: height * 1.24,
			glowOpacity: 0.32
		};
	}

	if (scene.surface === 'desktop') {
		const width = videoWidth * (showLockup ? 0.72 : 0.76);
		const aspectRatio = showLockup ? 1.68 : 1.72;
		const height = width / aspectRatio;

		return {
			left: centerX - width / 2,
			top: centerY - height / 2,
			width,
			height,
			glowWidth: width * 1.2,
			glowHeight: height * 1.26,
			glowOpacity: 0.3
		};
	}

	if (scene.mediaType === 'recording') {
		const width = videoWidth * 0.32;
		const height = videoHeight * (showLockup ? 0.82 : 0.88);

		return {
			left: centerX - width / 2,
			top: centerY - height / 2,
			width,
			height,
			glowWidth: width * 1.9,
			glowHeight: height * 1.16,
			glowOpacity: 0.28
		};
	}

	const width = videoWidth * 0.29;
	const height = videoHeight * (showLockup ? 0.76 : 0.82);

	return {
		left: centerX - width / 2,
		top: centerY - height / 2,
		width,
		height,
		glowWidth: width * 1.85,
		glowHeight: height * 1.12,
		glowOpacity: 0.26
	};
};

const getIncomingOffsetX = (layoutMetrics: SceneLayoutMetrics, videoWidth: number): number => {
	return videoWidth - layoutMetrics.left + getOffscreenMargin(videoWidth);
};

const getOutgoingOffsetX = (layoutMetrics: SceneLayoutMetrics, videoWidth: number): number => {
	return -(layoutMetrics.left + layoutMetrics.width + getOffscreenMargin(videoWidth));
};

export const SceneStage: React.FC<SceneStageProps> = ({
	domainLabel,
	palette,
	projectName,
	scene,
	sceneCount,
	sceneIndex,
	showLockup,
	shouldAnimateIn,
	shouldAnimateOut,
	transitionDurationInFrames
}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const layoutMetrics = getSceneLayoutMetrics(scene, showLockup, width, height);
	const exitStartFrame = Math.max(0, scene.durationInFrames - transitionDurationInFrames);
	const exitFrame = frame - exitStartFrame;
	const incomingOffsetX = getIncomingOffsetX(layoutMetrics, width);
	const outgoingOffsetX = getOutgoingOffsetX(layoutMetrics, width);
	const enterTranslateX = shouldAnimateIn
		? interpolate(frame, [0, transitionDurationInFrames], [incomingOffsetX, 0], {
				easing: Easing.out(Easing.cubic),
				...clampedInterpolation
			})
		: 0;
	const exitTranslateX = shouldAnimateOut
		? interpolate(exitFrame, [0, transitionDurationInFrames], [0, outgoingOffsetX], {
				easing: Easing.out(Easing.cubic),
				...clampedInterpolation
			})
		: 0;
	const enterOpacity = shouldAnimateIn
		? interpolate(frame, [0, transitionDurationInFrames], [0, 1], {
				easing: Easing.out(Easing.cubic),
				...clampedInterpolation
			})
		: 1;
	const exitOpacity = shouldAnimateOut
		? interpolate(exitFrame, [0, transitionDurationInFrames], [1, 0], {
				easing: Easing.out(Easing.cubic),
				...clampedInterpolation
			})
		: 1;
	const stageOpacity = enterOpacity * exitOpacity;
	const headlineOpacity = stageOpacity;
	const translateX = enterTranslateX + exitTranslateX;
	const glowLeft = layoutMetrics.left + layoutMetrics.width / 2 - layoutMetrics.glowWidth / 2 + translateX;
	const glowTop = layoutMetrics.top + layoutMetrics.height / 2 - layoutMetrics.glowHeight / 2;
	const labelVariant = getSceneLabelVariant(scene);
	const headlineLayout = getHeadlineLayout(showLockup);
	const headlineFontSize = getHeadlineFontSize(scene.label);

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

	const frameStyle: CSSProperties = {
		left: layoutMetrics.left,
		top: layoutMetrics.top,
		width: layoutMetrics.width,
		height: layoutMetrics.height,
		zIndex: 12,
		opacity: stageOpacity,
		transform: `translate3d(${translateX}px, 0, 0)`
	};

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: glowLeft,
					top: glowTop,
					width: layoutMetrics.glowWidth,
					height: layoutMetrics.glowHeight,
					background: `radial-gradient(circle at center, ${palette.glow}, transparent 68%)`,
					filter: 'blur(24px)',
					opacity: stageOpacity * layoutMetrics.glowOpacity
				}}
			/>

			<div
				style={{
					position: 'absolute',
					display: 'flex',
					flexDirection: 'column',
					gap: 0,
					maxWidth: 860,
					zIndex: 2,
					opacity: headlineOpacity,
					...headlineLayout
				}}
			>
				<div
					style={{
						fontFamily: displayFontFamily,
						fontSize: headlineFontSize,
						fontWeight: 700,
						lineHeight: 0.9,
						letterSpacing: '-0.055em',
						color: overlayTextStrong,
						textShadow:
							'0 18px 56px rgba(0,0,0,0.34), 0 2px 0 rgba(255,255,255,0.08)'
					}}
				>
					{scene.label}
				</div>
			</div>

			{scene.surface === 'desktop' ? (
				<BrowserFrame style={frameStyle} url={domainLabel}>
					{stageBody}
				</BrowserFrame>
			) : (
				<PhoneFrame style={frameStyle}>{stageBody}</PhoneFrame>
			)}
		</AbsoluteFill>
	);
};
