import React, {useMemo} from 'react';
import {AbsoluteFill, Series, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {SceneStage} from '../components/SceneStage';
import {getProjectSceneStartFrames, getProjectTimeline} from '../lib/assets';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';

export type ProjectPreviewProps = {
	projectId: string;
	showLockup?: boolean;
};

const overlayTextStrong = 'rgba(246, 250, 249, 0.96)';
const overlayTextMuted = 'rgba(220, 233, 229, 0.74)';

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({projectId, showLockup = true}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const timeline = useMemo(() => getProjectTimeline(projectId, fps), [projectId, fps]);
	const sceneStartFrames = useMemo(() => {
		return getProjectSceneStartFrames(timeline.scenes, timeline.transitionDurationInFrames);
	}, [timeline.scenes, timeline.transitionDurationInFrames]);
	const currentSceneIndex = sceneStartFrames.reduce((activeIndex, startFrame, index) => {
		return frame >= startFrame ? index : activeIndex;
	}, 0);
	const domainLabel = timeline.project.website?.replace(/^https?:\/\//, '') ?? 'Desktop app preview';

	return (
		<AbsoluteFill style={{color: timeline.palette.label, fontFamily: bodyFontFamily}}>
			<Background palette={timeline.palette} />
			<AbsoluteFill style={{padding: '68px 78px 62px'}}>
				{showLockup ? (
					<div
						style={{
							position: 'absolute',
							top: 68,
							right: 78,
							display: 'flex',
							justifyContent: 'flex-end',
							zIndex: 10
						}}
					>
						<div
							style={{
								maxWidth: 320,
								padding: 22,
								borderRadius: 28,
								background: 'rgba(6, 16, 15, 0.48)',
								boxShadow:
									'0 24px 70px rgba(0, 0, 0, 0.26), inset 0 0 0 1px rgba(255,255,255,0.12)',
								backdropFilter: 'blur(24px)'
							}}
						>
							<div
								style={{
									fontFamily: displayFontFamily,
									fontSize: 18,
									fontWeight: 700,
									letterSpacing: '0.08em',
									textTransform: 'uppercase',
									color: overlayTextStrong
								}}
							>
								{timeline.project.status === 'live' ? 'Live project' : 'Project in progress'}
							</div>
							<div
								style={{
									marginTop: 10,
									fontSize: 18,
									lineHeight: 1.45,
									color: overlayTextMuted
								}}
							>
								{timeline.project.summary}
							</div>
						</div>
					</div>
				) : null}

				<Series>
					{timeline.scenes.map((scene, index) => (
						<Series.Sequence
							key={scene.id}
							durationInFrames={scene.durationInFrames}
							offset={index === 0 ? 0 : -timeline.transitionDurationInFrames}
						>
							<SceneStage
								domainLabel={domainLabel}
								palette={timeline.palette}
								projectName={timeline.project.name}
								scene={scene}
								sceneCount={timeline.scenes.length}
								sceneIndex={index}
								showLockup={showLockup}
								transitionDurationInFrames={timeline.transitionDurationInFrames}
							/>
						</Series.Sequence>
					))}
				</Series>

				<div
					style={{
						position: 'absolute',
						left: 78,
						bottom: 62,
						display: 'flex',
						gap: 10,
						zIndex: 12
					}}
				>
					{timeline.scenes.map((scene, index) => (
						<div
							key={scene.id}
							style={{
								width: index === currentSceneIndex ? 38 : 14,
								height: 14,
								borderRadius: 999,
								background:
									index === currentSceneIndex
										? timeline.palette.highlight
										: 'rgba(255,255,255,0.42)',
								boxShadow:
									index === currentSceneIndex
										? `0 10px 28px ${timeline.palette.glow}`
										: 'inset 0 0 0 1px rgba(255,255,255,0.18)'
							}}
						/>
					))}
				</div>

				{!timeline.anyRealAsset ? (
					<div
						style={{
							position: 'absolute',
							left: 78,
							bottom: 96,
							padding: '18px 22px',
							borderRadius: 22,
							background: 'rgba(20, 26, 40, 0.78)',
							color: 'rgba(255,255,255,0.9)',
							maxWidth: 430,
							boxShadow: '0 28px 80px rgba(0,0,0,0.22)'
						}}
					>
						<div
							style={{
								fontFamily: displayFontFamily,
								fontSize: 17,
								fontWeight: 700,
								letterSpacing: '0.08em',
								textTransform: 'uppercase'
							}}
						>
							Add real captures
						</div>
						<div
							style={{
								marginTop: 10,
								fontSize: 17,
								lineHeight: 1.5,
								color: 'rgba(255,255,255,0.8)'
							}}
						>
							Add files under `remotion/public/projects/` and wire them in
							`remotion/src/lib/assets.ts`.
						</div>
					</div>
				) : null}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
