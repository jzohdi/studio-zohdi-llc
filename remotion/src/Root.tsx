import React from 'react';
import {Composition} from 'remotion';
import {motionProjects} from './data/projects';
import {
	PortfolioOverview,
	portfolioOverviewDurationInFrames
} from './compositions/PortfolioOverview';
import {ProjectPreview, type ProjectPreviewProps} from './compositions/ProjectPreview';

const projectPreviewDurationInFrames = 240;
const fps = 30;
const width = 1920;
const height = 1080;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="PortfolioOverview"
				component={PortfolioOverview}
				durationInFrames={portfolioOverviewDurationInFrames}
				fps={fps}
				width={width}
				height={height}
			/>
			{motionProjects.map((project) => (
				<Composition
					key={project.id}
					id={`ProjectPreview-${project.id}`}
					component={ProjectPreview}
					durationInFrames={projectPreviewDurationInFrames}
					fps={fps}
					width={width}
					height={height}
					defaultProps={{
						projectId: project.id,
						showLockup: true
					}}
				/>
			))}
		</>
	);
};
