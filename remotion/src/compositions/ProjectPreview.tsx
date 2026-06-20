import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {BrowserFrame, PhoneFrame} from '../components/DeviceFrame';
import {MediaSurface} from '../components/MediaSurface';
import {getMotionProject} from '../data/projects';
import {hasAnyProjectAsset, resolveProjectAssets} from '../lib/assets';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';

export type ProjectPreviewProps = {
	projectId: string;
	showLockup?: boolean;
};

const pillStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	padding: '9px 14px',
	borderRadius: 999,
	background: 'rgba(255,255,255,0.62)',
	boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
	backdropFilter: 'blur(18px)',
	fontSize: 13,
	fontWeight: 600,
	letterSpacing: '0.1em',
	textTransform: 'uppercase' as const
};

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({projectId, showLockup = true}) => {
	const project = getMotionProject(projectId);
	const assets = resolveProjectAssets(projectId);
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const phase = (frame / durationInFrames) * Math.PI * 2;
	const browserY = Math.sin(phase) * -18;
	const browserRotate = Math.sin(phase * 0.45) * 1.8;
	const browserScale = interpolate(Math.cos(phase * 0.85), [-1, 1], [1.005, 1.03]);
	const phoneY = Math.cos(phase * 1.22 + 0.7) * 22;
	const phoneRotate = -7 + Math.sin(phase * 0.9 + 0.5) * 3.2;
	const detailY = Math.sin(phase * 1.08 + 1.2) * 14;
	const detailRotate = Math.cos(phase * 0.6 + 1.4) * -2.2;
	const labelOpacity = interpolate(Math.sin(phase * 0.65), [-1, 1], [0.88, 1]);

	const browserAsset = assets.flow ?? assets.desktop;
	const detailAsset = assets.detail ?? assets.desktop ?? assets.flow;
	const anyAssetLoaded = hasAnyProjectAsset(assets);
	const domainLabel = project.website?.replace(/^https?:\/\//, '') ?? 'Desktop app preview';

	return (
		<AbsoluteFill style={{color: project.palette.label, fontFamily: bodyFontFamily}}>
			<Background palette={project.palette} />
			<AbsoluteFill style={{padding: '68px 78px 62px'}}>
				{showLockup ? (
					<div
						style={{
							position: 'absolute',
							top: 68,
							left: 78,
							right: 78,
							display: 'flex',
							alignItems: 'flex-start',
							justifyContent: 'space-between',
							gap: 24,
							zIndex: 10
						}}
					>
						<div>
							<div
								style={{
									...pillStyle,
									color: project.palette.label,
									opacity: labelOpacity
								}}
							>
								Studio Zohdi
							</div>
							<div
								style={{
									marginTop: 18,
									fontFamily: displayFontFamily,
									fontSize: 98,
									fontWeight: 700,
									lineHeight: 0.86,
									letterSpacing: '-0.05em',
									textTransform: 'uppercase'
								}}
							>
								{project.nameLines.map((line) => (
									<div key={line}>{line}</div>
								))}
							</div>
						</div>
						<div
							style={{
								maxWidth: 320,
								padding: 22,
								borderRadius: 28,
								background: 'rgba(255,255,255,0.56)',
								boxShadow: `0 24px 70px rgba(16, 20, 38, 0.12), inset 0 0 0 1px ${project.palette.border}`,
								backdropFilter: 'blur(24px)'
							}}
						>
							<div
								style={{
									fontFamily: displayFontFamily,
									fontSize: 18,
									fontWeight: 700,
									letterSpacing: '0.08em',
									textTransform: 'uppercase'
								}}
							>
								{project.status === 'live' ? 'Live project' : 'Project in progress'}
							</div>
							<div
								style={{
									marginTop: 10,
									fontSize: 18,
									lineHeight: 1.45,
									color: 'rgba(18, 24, 38, 0.74)'
								}}
							>
								{project.summary}
							</div>
						</div>
					</div>
				) : null}

				<BrowserFrame
					style={{
						left: '7%',
						top: showLockup ? '28%' : '15%',
						width: '66%',
						height: showLockup ? '56%' : '66%',
						transform: `translateY(${browserY}px) rotate(${browserRotate}deg) scale(${browserScale})`
					}}
					url={domainLabel}
				>
					<div style={{position: 'relative', width: '100%', height: '100%'}}>
						<MediaSurface
							asset={browserAsset}
							label={assets.flow ? 'Flow clip' : 'Desktop shot'}
							palette={project.palette}
							projectName={project.name}
							variant={assets.flow ? 'flow' : 'desktop'}
						/>
						<AbsoluteFill
							style={{
								background:
									'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0.06) 100%)'
							}}
						/>
					</div>
				</BrowserFrame>

				<PhoneFrame
					style={{
						right: '11%',
						top: showLockup ? '23%' : '18%',
						width: '18%',
						height: '58%',
						transform: `translateY(${phoneY}px) rotate(${phoneRotate}deg)`
					}}
				>
					<div style={{position: 'relative', width: '100%', height: '100%'}}>
						<MediaSurface
							asset={assets.mobile}
							label="Mobile shot"
							palette={project.palette}
							projectName={project.name}
							variant="mobile"
						/>
						<AbsoluteFill
							style={{
								background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 24%)'
							}}
						/>
					</div>
				</PhoneFrame>

				<div
					style={{
						position: 'absolute',
						left: '12%',
						bottom: showLockup ? '10%' : '8%',
						width: '27%',
						height: '23%',
						padding: 12,
						borderRadius: 28,
						background: 'rgba(255,255,255,0.34)',
						boxShadow: `0 24px 80px rgba(16, 20, 38, 0.12), inset 0 0 0 1px ${project.palette.border}`,
						backdropFilter: 'blur(26px)',
						transform: `translateY(${detailY}px) rotate(${detailRotate}deg)`
					}}
				>
					<div
						style={{
							width: '100%',
							height: '100%',
							borderRadius: 20,
							overflow: 'hidden'
						}}
					>
						<MediaSurface
							asset={detailAsset}
							label="Detail crop"
							palette={project.palette}
							projectName={project.name}
							variant="detail"
						/>
					</div>
				</div>

				<div
					style={{
						position: 'absolute',
						right: '14%',
						bottom: showLockup ? '8%' : '7%',
						width: showLockup ? 320 : 280,
						padding: 24,
						borderRadius: 30,
						background: 'rgba(255,255,255,0.52)',
						boxShadow: `0 22px 70px rgba(16, 20, 38, 0.1), inset 0 0 0 1px ${project.palette.border}`,
						backdropFilter: 'blur(24px)'
					}}
				>
					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							gap: 10,
							marginBottom: 18
						}}
					>
						<div style={pillStyle}>{project.status === 'live' ? 'Live' : 'Planned'}</div>
						<div style={pillStyle}>{assets.flow ? 'Screen Studio footage' : 'Screenshot-driven'}</div>
					</div>
					<div
						style={{
							fontFamily: displayFontFamily,
							fontSize: 26,
							fontWeight: 700,
							lineHeight: 0.94,
							letterSpacing: '-0.03em',
							textTransform: 'uppercase'
						}}
					>
						{project.name}
					</div>
					<div
						style={{
							marginTop: 12,
							fontSize: 18,
							lineHeight: 1.45,
							color: 'rgba(18, 24, 38, 0.74)'
						}}
					>
						Use `desktop`, `mobile`, `detail`, and `flow` files to control this scene.
					</div>
				</div>

				{!anyAssetLoaded ? (
					<div
						style={{
							position: 'absolute',
							left: 78,
							bottom: 60,
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
							Drop files into `remotion/public/projects/{project.id}/` and this preview will pick
							them up automatically.
						</div>
					</div>
				) : null}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
