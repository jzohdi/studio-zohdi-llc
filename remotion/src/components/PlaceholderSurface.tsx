import React from 'react';
import type {CSSProperties} from 'react';
import type {MotionPalette} from '../data/projects';
import {bodyFontFamily, displayFontFamily} from '../lib/fonts';

type PlaceholderVariant = 'desktop' | 'mobile' | 'detail' | 'flow';

type PlaceholderSurfaceProps = {
	label: string;
	projectName: string;
	palette: MotionPalette;
	variant: PlaceholderVariant;
};

const lineStyle = (width: string, opacity = 0.14): CSSProperties => ({
	width,
	height: 14,
	borderRadius: 999,
	background: `rgba(20, 25, 40, ${opacity})`
});

export const PlaceholderSurface: React.FC<PlaceholderSurfaceProps> = ({
	label,
	projectName,
	palette,
	variant
}) => {
	const isMobile = variant === 'mobile';
	const isDetail = variant === 'detail';
	const gridColumns = isMobile ? '1fr' : '1.1fr 0.88fr';

	return (
		<div
			style={{
				position: 'relative',
				width: '100%',
				height: '100%',
				padding: isMobile ? 26 : 30,
				background: `linear-gradient(160deg, rgba(255,255,255,0.95) 0%, ${palette.surface} 100%)`,
				color: palette.label,
				overflow: 'hidden'
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `radial-gradient(circle at top right, ${palette.glow}, transparent 36%)`
				}}
			/>
			<div
				style={{
					position: 'relative',
					zIndex: 2,
					display: 'flex',
					flexDirection: 'column',
					height: '100%'
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 22
					}}
				>
					<div
						style={{
							fontFamily: displayFontFamily,
							fontSize: isMobile ? 18 : 20,
							fontWeight: 700,
							letterSpacing: '0.08em',
							textTransform: 'uppercase'
						}}
					>
						{label}
					</div>
					<div
						style={{
							padding: '6px 10px',
							borderRadius: 999,
							background: 'rgba(255,255,255,0.72)',
							fontFamily: bodyFontFamily,
							fontSize: 11,
							fontWeight: 600,
							letterSpacing: '0.08em',
							textTransform: 'uppercase'
						}}
					>
						Add real asset
					</div>
				</div>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: gridColumns,
						gap: isMobile ? 18 : 22,
						flex: 1
					}}
				>
					<div
						style={{
							display: 'grid',
							gridTemplateRows: isDetail ? '1fr auto' : '1.1fr auto',
							gap: 18
						}}
					>
						<div
							style={{
								borderRadius: isMobile ? 28 : 24,
								background:
									variant === 'flow'
										? `linear-gradient(135deg, ${palette.highlight}, rgba(255,255,255,0.78))`
										: `linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.4)), linear-gradient(135deg, ${palette.highlight}, rgba(255,255,255,0.1))`,
								boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)'
							}}
						/>
						<div style={{display: 'grid', gap: 12}}>
							<div style={lineStyle('42%', 0.18)} />
							<div style={lineStyle('88%')} />
							<div style={lineStyle('74%')} />
						</div>
					</div>
					{!isMobile && (
						<div style={{display: 'grid', gap: 16}}>
							<div
								style={{
									padding: 18,
									borderRadius: 22,
									background: 'rgba(255,255,255,0.72)',
									boxShadow: `inset 0 0 0 1px ${palette.border}`
								}}
							>
								<div
									style={{
										fontFamily: displayFontFamily,
										fontSize: 28,
										fontWeight: 700,
										lineHeight: 0.92,
										letterSpacing: '-0.03em'
									}}
								>
									{projectName}
								</div>
								<div
									style={{
										marginTop: 8,
										fontFamily: bodyFontFamily,
										fontSize: 14,
										lineHeight: 1.45,
										color: 'rgba(20, 25, 40, 0.7)'
									}}
								>
									Drop `desktop`, `mobile`, `detail`, or `flow` files into this project's folder.
								</div>
							</div>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
									gap: 12
								}}
							>
								{Array.from({length: 3}).map((_, index) => (
									<div
										key={index}
										style={{
											aspectRatio: '1 / 1',
											borderRadius: 18,
											background: 'rgba(255,255,255,0.62)',
											boxShadow: `inset 0 0 0 1px ${palette.border}`
										}}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
