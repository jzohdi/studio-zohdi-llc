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

const getTextFrameLayout = (showLockup: boolean): CSSProperties => {
	return {
		width: '100%',
		paddingLeft: showLockup ? 92 : 84,
		paddingRight: showLockup ? 128 : 96
	};
};

const getTextFrameFontSize = (text: string): number => {
	const lines = text.split('\n');
	const longestLineLength = lines.reduce((longest, line) => Math.max(longest, line.trim().length), 0);

	if (lines.length >= 4 || longestLineLength >= 34) {
		return 92;
	}

	if (lines.length >= 3 || longestLineLength >= 24) {
		return 108;
	}

	return 124;
};

const getSceneLayoutMetrics = (
	scene: ResolvedProjectScene,
	showLockup: boolean,
	videoWidth: number,
	videoHeight: number
): SceneLayoutMetrics => {
	const centerX = videoWidth / 2;
	const centerY = videoHeight * 0.5;

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
	showLockup,
	shouldAnimateIn,
	shouldAnimateOut,
	transitionDurationInFrames
}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const exitStartFrame = Math.max(0, scene.durationInFrames - transitionDurationInFrames);
	const exitFrame = frame - exitStartFrame;
	const isTextScene = scene.kind === 'text';
	const layoutMetrics = isTextScene ? null : getSceneLayoutMetrics(scene, showLockup, width, height);
	const textTravelDistance = width + Math.max(220, Math.round(width * 0.18));
	const incomingOffsetX = isTextScene
		? textTravelDistance
		: getIncomingOffsetX(layoutMetrics!, width);
	const outgoingOffsetX = isTextScene
		? -textTravelDistance
		: getOutgoingOffsetX(layoutMetrics!, width);
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
	const translateX = enterTranslateX + exitTranslateX;

	if (isTextScene) {
		const textFrameLayout = getTextFrameLayout(showLockup);
		const textFrameFontSize = getTextFrameFontSize(scene.text ?? '');

		return (
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: '82%',
						height: '52%',
						background: `radial-gradient(circle at center, ${palette.glow}, transparent 68%)`,
						filter: 'blur(40px)',
						transform: `translate(-50%, -50%) translate3d(${translateX}px, 0, 0)`,
						opacity: stageOpacity * 0.34
					}}
				/>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						opacity: stageOpacity,
						transform: `translate3d(${translateX}px, 0, 0)`
					}}
				>
					<div style={textFrameLayout}>
						<div
							style={{
								maxWidth: 1500,
								fontFamily: displayFontFamily,
								fontSize: textFrameFontSize,
								fontWeight: 700,
								lineHeight: 0.9,
								letterSpacing: '-0.055em',
								whiteSpace: 'pre-wrap',
								color: overlayTextStrong,
								textShadow:
									'0 18px 56px rgba(0,0,0,0.34), 0 2px 0 rgba(255,255,255,0.08)'
							}}
						>
							{scene.text}
						</div>
					</div>
				</div>
			</AbsoluteFill>
		);
	}

	const mediaLayoutMetrics = layoutMetrics;

	if (!mediaLayoutMetrics) {
		return null;
	}

	const glowLeft =
		mediaLayoutMetrics.left +
		mediaLayoutMetrics.width / 2 -
		mediaLayoutMetrics.glowWidth / 2 +
		translateX;
	const glowTop =
		mediaLayoutMetrics.top +
		mediaLayoutMetrics.height / 2 -
		mediaLayoutMetrics.glowHeight / 2;
	const labelVariant = getSceneLabelVariant(scene);
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
		left: mediaLayoutMetrics.left,
		top: mediaLayoutMetrics.top,
		width: mediaLayoutMetrics.width,
		height: mediaLayoutMetrics.height,
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
					width: mediaLayoutMetrics.glowWidth,
					height: mediaLayoutMetrics.glowHeight,
					background: `radial-gradient(circle at center, ${palette.glow}, transparent 68%)`,
					filter: 'blur(24px)',
					opacity: stageOpacity * mediaLayoutMetrics.glowOpacity
				}}
			/>
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
