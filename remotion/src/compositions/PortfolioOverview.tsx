import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionProjects} from '../data/projects';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';
import {getProjectTimeline, getPortfolioOverviewDurationInFrames} from '../lib/assets';
import {ProjectPreview} from './ProjectPreview';

type OverviewTitleCardProps = {
	durationInFrames: number;
	label: string;
	nameLines: string[];
	paletteBorder: string;
	paletteLabel: string;
	summary: string;
	website?: string;
};

const OverviewTitleCard: React.FC<OverviewTitleCardProps> = ({
	durationInFrames,
	label,
	nameLines,
	paletteBorder,
	paletteLabel,
	summary,
	website
}) => {
	const frame = useCurrentFrame();
	const outroStart = Math.max(26, durationInFrames - 26);
	const opacity = interpolate(frame, [0, 14, outroStart, durationInFrames], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp'
	});
	const translateY = interpolate(frame, [0, 18, durationInFrames], [36, 0, -18], {
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
					color: paletteLabel
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
					{nameLines.map((line) => (
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
					{summary}
				</div>
			</div>
			<div
				style={{
					padding: '16px 20px',
					borderRadius: 24,
					background: 'rgba(255,255,255,0.6)',
					boxShadow: `0 22px 70px rgba(16, 20, 38, 0.12), inset 0 0 0 1px ${paletteBorder}`,
					backdropFilter: 'blur(22px)',
					fontFamily: bodyFontFamily,
					fontSize: 18,
					fontWeight: 600,
					color: paletteLabel
				}}
			>
				{website?.replace(/^https?:\/\//, '') ?? label}
			</div>
		</div>
	);
};

export const PortfolioOverview: React.FC = () => {
	const {fps} = useVideoConfig();
	const projectTimelines = useMemo(() => {
		return motionProjects.map((project) => getProjectTimeline(project.id, fps));
	}, [fps]);

	let cursor = 0;

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

			{projectTimelines.map((timeline) => {
				const from = cursor;
				cursor += timeline.totalDurationInFrames;

				return (
					<Sequence
						key={timeline.project.id}
						from={from}
						durationInFrames={timeline.totalDurationInFrames}
					>
						<ProjectPreview projectId={timeline.project.id} showLockup={false} />
						<OverviewTitleCard
							durationInFrames={timeline.totalDurationInFrames}
							label="Desktop app preview"
							nameLines={timeline.project.nameLines}
							paletteBorder={timeline.palette.border}
							paletteLabel={timeline.palette.label}
							summary={timeline.project.summary}
							website={timeline.project.website}
						/>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const portfolioOverviewDurationInFrames = (fps: number): number => {
	return getPortfolioOverviewDurationInFrames(fps);
};
