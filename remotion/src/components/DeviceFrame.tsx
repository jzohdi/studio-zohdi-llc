import React from 'react';
import type {CSSProperties, ReactNode} from 'react';

type BrowserFrameProps = {
	children: ReactNode;
	style?: CSSProperties;
	url?: string;
};

type PhoneFrameProps = {
	children: ReactNode;
	style?: CSSProperties;
};

const screenStyle: CSSProperties = {
	flex: 1,
	minHeight: 0,
	borderRadius: 24,
	overflow: 'hidden',
	background: 'rgba(255,255,255,0.96)'
};

export const BrowserFrame: React.FC<BrowserFrameProps> = ({children, style, url}) => {
	return (
		<div
			style={{
				position: 'absolute',
				display: 'flex',
				flexDirection: 'column',
				boxSizing: 'border-box',
				borderRadius: 34,
				padding: 14,
				border: '1px solid rgba(245, 251, 249, 0.44)',
				background: 'rgba(13, 15, 26, 0.9)',
				boxShadow:
					'0 36px 110px rgba(0, 0, 0, 0.38), inset 0 0 0 1px rgba(255,255,255,0.05)',
				backdropFilter: 'blur(18px)',
				...style
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					height: 38,
					paddingInline: 10
				}}
			>
				<div style={{width: 11, height: 11, borderRadius: 999, background: '#ff6b63'}} />
				<div style={{width: 11, height: 11, borderRadius: 999, background: '#ffcf3f'}} />
				<div style={{width: 11, height: 11, borderRadius: 999, background: '#2ad05b'}} />
				<div
					style={{
						flex: 1,
						marginLeft: 12,
						padding: '8px 14px',
						borderRadius: 999,
						background: 'rgba(255,255,255,0.12)',
						color: 'rgba(255,255,255,0.72)',
						fontSize: 13,
						fontWeight: 500,
						letterSpacing: '0.02em'
					}}
				>
					{url ?? 'Preview Surface'}
				</div>
			</div>
			<div style={screenStyle}>{children}</div>
		</div>
	);
};

export const PhoneFrame: React.FC<PhoneFrameProps> = ({children, style}) => {
	return (
		<div
			style={{
				position: 'absolute',
				display: 'flex',
				flexDirection: 'column',
				boxSizing: 'border-box',
				borderRadius: 42,
				padding: 10,
				border: '1px solid rgba(245, 251, 249, 0.22)',
				background:
					'linear-gradient(180deg, rgba(20, 23, 34, 0.94), rgba(7, 10, 18, 0.98) 100%)',
				boxShadow:
					'0 30px 90px rgba(0, 0, 0, 0.34), inset 0 0 0 1px rgba(255,255,255,0.04)',
				...style
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 17,
					left: '50%',
					width: '34%',
					height: 25,
					borderRadius: 999,
					background: 'rgba(0,0,0,0.65)',
					transform: 'translateX(-50%)',
					zIndex: 3
				}}
			/>
			<div
				style={{
					...screenStyle,
					borderRadius: 34
				}}
			>
				{children}
			</div>
		</div>
	);
};
