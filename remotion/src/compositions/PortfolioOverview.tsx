import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {motionProjects, type MotionProject} from '../data/projects';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';
import {ProjectPreview} from './ProjectPreview';

export const portfolioOverviewSegmentLength = 90;
export const portfolioOverviewDurationInFrames =
	motionProjects.length * portfolioOverviewSegmentLength;

const OverviewTitleCard: React.FC<{project: MotionProject}> = ({project}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 14, 68, 88], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp'
	});
	const translateY = interpolate(frame, [0, 18, 90], [36, 0, -18], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp'
	});

	return (
		<div
			style={{
				position: 'absolute',
				left: 78,
				right: 78,
				bottom: 68,
				display: 'flex',
				alignItems: 'flex-end',
				justifyContent: 'space-between',
				gap: 24,
				opacity,
				transform: `translateY(${translateY}px)`
			}}
		>
			<div
				style={{
					maxWidth: 820,
					color: project.palette.label
				}}
			>
				<div
					style={{
						fontFamily: displayFontFamily,
						fontSize: 86,
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
				<div
					style={{
						marginTop: 18,
						fontFamily: bodyFontFamily,
						fontSize: 23,
						lineHeight: 1.45,
						color: 'rgba(18, 24, 38, 0.72)'
					}}
				>
					{project.summary}
				</div>
			</div>
			<div
				style={{
					padding: '16px 20px',
					borderRadius: 24,
					background: 'rgba(255,255,255,0.6)',
					boxShadow: `0 22px 70px rgba(16, 20, 38, 0.12), inset 0 0 0 1px ${project.palette.border}`,
					backdropFilter: 'blur(22px)',
					fontFamily: bodyFontFamily,
					fontSize: 18,
					fontWeight: 600,
					color: project.palette.label
				}}
			>
				{project.website?.replace(/^https?:\/\//, '') ?? 'Desktop app preview'}
			</div>
		</div>
	);
};

export const PortfolioOverview: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#f8f5f1'}}>
			<div
				style={{
					position: 'absolute',
					top: 52,
					left: 78,
					zIndex: 30,
					padding: '10px 14px',
					borderRadius: 999,
					background: 'rgba(255,255,255,0.62)',
					backdropFilter: 'blur(18px)',
					boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
					fontFamily: bodyFontFamily,
					fontSize: 13,
					fontWeight: 700,
					letterSpacing: '0.12em',
					textTransform: 'uppercase',
					color: '#1b1c23'
				}}
			>
				Studio Zohdi / Portfolio Overview
			</div>

			{motionProjects.map((project, index) => (
				<Sequence
					key={project.id}
					from={index * portfolioOverviewSegmentLength}
					durationInFrames={portfolioOverviewSegmentLength}
				>
					<ProjectPreview projectId={project.id} showLockup={false} />
					<OverviewTitleCard project={project} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
