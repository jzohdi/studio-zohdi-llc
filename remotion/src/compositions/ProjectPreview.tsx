import React, {useMemo} from 'react';
import {AbsoluteFill, Series, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {SceneStage} from '../components/SceneStage';
import {
	getLoopedProjectScenes,
	getProjectSceneStartFrames,
	getProjectTimeline,
	type ResolvedProjectScene
} from '../lib/assets';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';

export type ProjectPreviewProps = {
	projectId: string;
	showLockup?: boolean;
	loopToFirst?: boolean;
};

type RenderScene = {
	key: string;
	scene: ResolvedProjectScene;
	displayIndex: number;
};

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({
	projectId,
	showLockup = true,
	loopToFirst = true
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const timeline = useMemo(() => getProjectTimeline(projectId, fps), [projectId, fps]);
	const renderScenes = useMemo<RenderScene[]>(() => {
		const previewScenes = loopToFirst ? getLoopedProjectScenes(timeline.scenes) : timeline.scenes;

		return previewScenes.map((scene, index) => ({
			key: scene.id,
			scene,
			displayIndex: index >= timeline.scenes.length ? 0 : index
		}));
	}, [loopToFirst, timeline.scenes]);
	const sceneStartFrames = useMemo(() => {
		return getProjectSceneStartFrames(
			renderScenes.map((renderScene) => renderScene.scene),
			timeline.transitionDurationInFrames
		);
	}, [renderScenes, timeline.transitionDurationInFrames]);
	const currentRenderSceneIndex = sceneStartFrames.reduce((activeIndex, startFrame, index) => {
		return frame >= startFrame ? index : activeIndex;
	}, 0);
	const currentSceneIndex = renderScenes[currentRenderSceneIndex]?.displayIndex ?? 0;
	const domainLabel = timeline.project.website?.replace(/^https?:\/\//, '') ?? 'Desktop app preview';

	return (
		<AbsoluteFill style={{color: timeline.palette.label, fontFamily: bodyFontFamily}}>
			<Background palette={timeline.palette} />
			<AbsoluteFill style={{padding: '68px 78px 62px'}}>
				<Series>
					{renderScenes.map((renderScene, renderIndex) => (
						<Series.Sequence
							key={renderScene.key}
							durationInFrames={renderScene.scene.durationInFrames}
							offset={renderIndex === 0 ? 0 : -timeline.transitionDurationInFrames}
						>
							<SceneStage
								domainLabel={domainLabel}
								palette={timeline.palette}
								projectName={timeline.project.name}
								scene={renderScene.scene}
								sceneCount={timeline.scenes.length}
								sceneIndex={renderScene.displayIndex}
								showLockup={showLockup}
								shouldAnimateIn={renderIndex !== 0}
								shouldAnimateOut={renderIndex !== renderScenes.length - 1}
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
