<script lang="ts">
	import type { FeaturedProject } from '$lib/data/featured-projects';

	type PreviewSize = 'desktop' | 'mobile';

	interface Props {
		project: FeaturedProject;
		size?: PreviewSize;
		isActive?: boolean;
	}

	let { project, size = 'desktop', isActive = false }: Props = $props();
</script>

<div
	class={`preview-card preview-card--${size}`}
	data-variant={project.previewVariant}
	data-active={isActive}
	aria-hidden="true"
>
	<div class="preview-card__glow"></div>
	<div class="preview-card__surface">
		<span class="preview-card__tag">{project.previewLabel}</span>

		{#if project.previewVariant === 'malibou'}
			<div class="scene scene--malibou">
				<div class="malibou-phone">
					<div class="malibou-phone__screen">
						<span></span>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>

				<div class="malibou-panel">
					<span class="malibou-panel__eyebrow"></span>
					<span class="malibou-panel__bar malibou-panel__bar--strong"></span>
					<span class="malibou-panel__bar"></span>
					<div class="malibou-panel__stats">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>

				<div class="malibou-strip">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
		{:else if project.previewVariant === 'zefir'}
			<div class="scene scene--zefir">
				<div class="zefir-grid">
					<span class="zefir-grid__tower zefir-grid__tower--tall"></span>
					<span class="zefir-grid__tower zefir-grid__tower--mid"></span>
					<span class="zefir-grid__tower zefir-grid__tower--short"></span>
				</div>

				<div class="zefir-listing">
					<span class="zefir-listing__cover"></span>
					<span class="zefir-listing__line zefir-listing__line--strong"></span>
					<span class="zefir-listing__line"></span>
					<div class="zefir-listing__chips">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{:else if project.previewVariant === 'heysimon'}
			<div class="scene scene--heysimon">
				<div class="heysimon-laptop">
					<div class="heysimon-laptop__screen">
						<div class="heysimon-laptop__stack">
							<span></span>
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
					<div class="heysimon-laptop__base"></div>
				</div>

				<span class="heysimon-sticker heysimon-sticker--one"></span>
				<span class="heysimon-sticker heysimon-sticker--two"></span>
			</div>
		{:else if project.previewVariant === 'osol'}
			<div class="scene scene--osol">
				<div class="osol-panel">
					<div class="osol-panel__ring"></div>
					<div class="osol-panel__chart">
						<span></span>
						<span></span>
						<span></span>
						<span></span>
					</div>
					<div class="osol-panel__footer">
						<span></span>
						<span></span>
					</div>
				</div>

				<div class="osol-badge"></div>
			</div>
		{:else}
			<div class="scene scene--supercomics">
				<div class="supercomics-panels">
					<span class="supercomics-panels__panel supercomics-panels__panel--one"></span>
					<span class="supercomics-panels__panel supercomics-panels__panel--two"></span>
					<span class="supercomics-panels__panel supercomics-panels__panel--three"></span>
				</div>

				<div class="supercomics-burst"></div>
				<div class="supercomics-dot supercomics-dot--one"></div>
				<div class="supercomics-dot supercomics-dot--two"></div>
			</div>
		{/if}
	</div>
</div>

<style>
	.preview-card {
		position: relative;
		width: 100%;
		aspect-ratio: 1.48 / 1;
		border-radius: clamp(1.45rem, 3vw, 2.35rem);
		overflow: hidden;
		isolation: isolate;
		box-shadow: var(--shadow-card);
	}

	.preview-card--mobile {
		aspect-ratio: 1.08 / 0.84;
		min-width: clamp(8.5rem, 31vw, 10.75rem);
	}

	.preview-card--desktop .preview-card__surface {
		padding: clamp(0.82rem, 1.45vw, 1.15rem);
	}

	.preview-card[data-active='true'] {
		filter: saturate(1.02);
	}

	.preview-card__glow {
		position: absolute;
		inset: -28%;
		background: radial-gradient(circle at top right, hsl(var(--pink) / 0.2), transparent 46%);
		pointer-events: none;
	}

	.preview-card__surface {
		position: relative;
		width: 100%;
		height: 100%;
		padding: clamp(0.9rem, 2vw, 1.35rem);
		border: 1px solid hsl(0 0% 100% / 0.35);
		border-radius: inherit;
	}

	.preview-card__surface::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, hsl(0 0% 100% / 0.08), transparent 40%);
		pointer-events: none;
	}

	.preview-card__tag {
		position: absolute;
		top: clamp(0.7rem, 1.8vw, 1rem);
		left: clamp(0.7rem, 1.8vw, 1rem);
		z-index: 2;
		padding: 0.38rem 0.7rem;
		border-radius: 999px;
		background: hsl(0 0% 100% / 0.56);
		backdrop-filter: blur(18px);
		color: hsl(222 20% 18% / 0.8);
		font-family: var(--font-display);
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.preview-card--mobile .preview-card__tag {
		font-size: 0.55rem;
		letter-spacing: 0.12em;
	}

	.preview-card--desktop .preview-card__tag {
		top: clamp(0.65rem, 1.25vw, 0.9rem);
		left: clamp(0.65rem, 1.25vw, 0.9rem);
	}

	.scene {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.preview-card[data-variant='malibou'] .preview-card__surface {
		background: linear-gradient(150deg, #fff4ea 0%, #f8dcc6 54%, #efc2a3 100%);
	}

	.malibou-phone {
		position: absolute;
		left: 10%;
		bottom: 12%;
		width: 38%;
		aspect-ratio: 0.68;
		border: 1px solid rgb(125 82 58 / 18%);
		border-radius: 1.8rem;
		background: rgb(255 255 255 / 70%);
		box-shadow: 0 24px 48px rgb(122 76 43 / 18%);
		transform: rotate(-8deg);
	}

	.malibou-phone__screen {
		display: grid;
		gap: 0.45rem;
		height: 100%;
		padding: 0.85rem 0.75rem;
	}

	.malibou-phone__screen span {
		border-radius: 999px;
		background: linear-gradient(90deg, rgb(198 124 77 / 92%), rgb(255 255 255 / 65%));
	}

	.malibou-phone__screen span:nth-child(1) {
		width: 42%;
		height: 0.38rem;
	}

	.malibou-phone__screen span:nth-child(2) {
		height: 0.8rem;
	}

	.malibou-phone__screen span:nth-child(3),
	.malibou-phone__screen span:nth-child(4) {
		height: 0.55rem;
	}

	.malibou-panel {
		position: absolute;
		top: 18%;
		right: 8%;
		width: 42%;
		padding: 0.95rem;
		border: 1px solid rgb(129 88 61 / 14%);
		border-radius: 1.4rem;
		background: rgb(255 255 255 / 72%);
		box-shadow: 0 20px 44px rgb(120 75 41 / 12%);
	}

	.malibou-panel__eyebrow,
	.malibou-panel__bar,
	.malibou-panel__stats span {
		display: block;
		border-radius: 999px;
	}

	.malibou-panel__eyebrow {
		width: 34%;
		height: 0.38rem;
		margin-bottom: 0.65rem;
		background: rgb(198 124 77 / 70%);
	}

	.malibou-panel__bar {
		height: 0.55rem;
		margin-bottom: 0.42rem;
		background: rgb(130 99 79 / 15%);
	}

	.malibou-panel__bar--strong {
		width: 72%;
		background: linear-gradient(90deg, rgb(198 124 77 / 90%), rgb(130 99 79 / 28%));
	}

	.malibou-panel__stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.4rem;
		margin-top: 0.75rem;
	}

	.malibou-panel__stats span {
		height: 2.1rem;
		background: linear-gradient(180deg, rgb(255 255 255 / 70%), rgb(238 197 164 / 85%));
	}

	.malibou-strip {
		position: absolute;
		right: 11%;
		bottom: 10%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.42rem;
		width: 36%;
	}

	.malibou-strip span {
		aspect-ratio: 1;
		border-radius: 0.8rem;
		background: rgb(255 255 255 / 62%);
		border: 1px solid rgb(125 82 58 / 10%);
	}

	.preview-card[data-variant='zefir'] .preview-card__surface {
		background: linear-gradient(160deg, #eff8f1 0%, #d8ecd9 58%, #cfe2d6 100%);
	}

	.zefir-grid {
		position: absolute;
		inset: 16% 11% 17% 8%;
		display: flex;
		align-items: end;
		gap: 0.7rem;
	}

	.zefir-grid__tower {
		flex: 1;
		border-radius: 1.25rem 1.25rem 0.5rem 0.5rem;
		background: linear-gradient(180deg, rgb(255 255 255 / 92%), rgb(132 180 142 / 46%));
		box-shadow: inset 0 0 0 1px rgb(74 122 84 / 10%);
	}

	.zefir-grid__tower--tall {
		height: 78%;
	}

	.zefir-grid__tower--mid {
		height: 62%;
	}

	.zefir-grid__tower--short {
		height: 48%;
	}

	.zefir-listing {
		position: absolute;
		right: 8%;
		bottom: 11%;
		width: 46%;
		padding: 0.85rem;
		border-radius: 1.35rem;
		background: rgb(255 255 255 / 76%);
		box-shadow: 0 20px 44px rgb(75 110 84 / 12%);
	}

	.zefir-listing__cover,
	.zefir-listing__line,
	.zefir-listing__chips span {
		display: block;
		border-radius: 999px;
	}

	.zefir-listing__cover {
		height: 3.4rem;
		margin-bottom: 0.75rem;
		border-radius: 0.95rem;
		background:
			linear-gradient(180deg, rgb(104 151 111 / 18%), rgb(255 255 255 / 0%)),
			linear-gradient(135deg, rgb(151 201 160 / 85%), rgb(224 243 227 / 85%));
	}

	.zefir-listing__line {
		height: 0.54rem;
		margin-bottom: 0.42rem;
		background: rgb(74 122 84 / 12%);
	}

	.zefir-listing__line--strong {
		width: 74%;
		background: linear-gradient(90deg, rgb(74 122 84 / 84%), rgb(74 122 84 / 18%));
	}

	.zefir-listing__chips {
		display: flex;
		gap: 0.36rem;
		margin-top: 0.7rem;
	}

	.zefir-listing__chips span {
		width: 2rem;
		height: 0.72rem;
		background: rgb(74 122 84 / 14%);
	}

	.preview-card[data-variant='heysimon'] .preview-card__surface {
		background: linear-gradient(160deg, #eef1ff 0%, #d4d8ff 48%, #dbe0f2 100%);
	}

	.heysimon-laptop {
		position: absolute;
		inset: 18% 10% 18% 10%;
	}

	.heysimon-laptop__screen {
		height: 72%;
		padding: 0.95rem;
		border: 1px solid rgb(70 82 146 / 12%);
		border-radius: 1.4rem 1.4rem 0.8rem 0.8rem;
		background: rgb(255 255 255 / 74%);
		box-shadow: 0 24px 48px rgb(74 85 148 / 12%);
	}

	.heysimon-laptop__stack {
		display: grid;
		grid-template-columns: 1.15fr 0.8fr;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
		height: 100%;
	}

	.heysimon-laptop__stack span {
		display: block;
		border-radius: 0.9rem;
	}

	.heysimon-laptop__stack span:nth-child(1) {
		grid-row: 1 / span 2;
		background: linear-gradient(180deg, rgb(64 93 255 / 78%), rgb(153 179 255 / 60%));
	}

	.heysimon-laptop__stack span:nth-child(2) {
		background: linear-gradient(135deg, rgb(255 101 176 / 78%), rgb(255 186 214 / 70%));
	}

	.heysimon-laptop__stack span:nth-child(3) {
		background: rgb(77 91 166 / 16%);
	}

	.heysimon-laptop__stack span:nth-child(4) {
		background: rgb(255 255 255 / 92%);
	}

	.heysimon-laptop__base {
		width: 84%;
		height: 0.95rem;
		margin: -0.15rem auto 0;
		border-radius: 999px;
		background: linear-gradient(90deg, rgb(109 121 188 / 35%), rgb(255 255 255 / 90%));
	}

	.heysimon-sticker {
		position: absolute;
		display: block;
		border-radius: 1rem;
		transform: rotate(-12deg);
	}

	.heysimon-sticker--one {
		top: 16%;
		right: 12%;
		width: 1.9rem;
		height: 1.9rem;
		background: linear-gradient(135deg, rgb(255 122 200 / 85%), rgb(255 212 231 / 74%));
	}

	.heysimon-sticker--two {
		right: 8%;
		bottom: 16%;
		width: 2.6rem;
		height: 1.1rem;
		border-radius: 999px;
		background: linear-gradient(90deg, rgb(64 93 255 / 85%), rgb(255 255 255 / 70%));
	}

	.preview-card[data-variant='osol'] .preview-card__surface {
		background: linear-gradient(160deg, #eefcf8 0%, #dff7ef 45%, #d6eef8 100%);
	}

	.osol-panel {
		position: absolute;
		inset: 18% 12% 16% 12%;
		padding: 1rem;
		border: 1px solid rgb(45 138 114 / 12%);
		border-radius: 1.5rem;
		background: rgb(255 255 255 / 72%);
		box-shadow: 0 22px 50px rgb(46 126 121 / 10%);
	}

	.osol-panel__ring {
		width: 3.6rem;
		height: 3.6rem;
		margin-bottom: 0.9rem;
		border: 0.7rem solid rgb(50 182 134 / 16%);
		border-top-color: rgb(50 182 134 / 85%);
		border-right-color: rgb(52 167 218 / 65%);
		border-radius: 50%;
	}

	.osol-panel__chart {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-items: end;
		gap: 0.45rem;
		height: 3.25rem;
		margin-bottom: 0.85rem;
	}

	.osol-panel__chart span {
		display: block;
		border-radius: 999px 999px 0.45rem 0.45rem;
		background: linear-gradient(180deg, rgb(52 167 218 / 88%), rgb(50 182 134 / 48%));
	}

	.osol-panel__chart span:nth-child(1) {
		height: 48%;
	}

	.osol-panel__chart span:nth-child(2) {
		height: 72%;
	}

	.osol-panel__chart span:nth-child(3) {
		height: 90%;
	}

	.osol-panel__chart span:nth-child(4) {
		height: 62%;
	}

	.osol-panel__footer {
		display: flex;
		gap: 0.45rem;
	}

	.osol-panel__footer span {
		display: block;
		height: 0.7rem;
		border-radius: 999px;
		background: rgb(46 126 121 / 14%);
	}

	.osol-panel__footer span:first-child {
		width: 46%;
	}

	.osol-panel__footer span:last-child {
		width: 28%;
	}

	.osol-badge {
		position: absolute;
		top: 16%;
		right: 12%;
		width: 3rem;
		aspect-ratio: 1;
		border-radius: 1rem;
		background:
			radial-gradient(circle at 30% 30%, rgb(255 255 255 / 90%), transparent 45%),
			linear-gradient(150deg, rgb(50 182 134 / 90%), rgb(52 167 218 / 64%));
		box-shadow: 0 18px 34px rgb(46 126 121 / 14%);
	}

	.preview-card[data-variant='supercomics'] .preview-card__surface {
		background: linear-gradient(145deg, #4f31ff 0%, #8d48ff 42%, #ff5fad 100%);
	}

	.preview-card[data-variant='supercomics'] .preview-card__tag {
		background: rgb(11 9 40 / 22%);
		color: rgb(255 255 255 / 92%);
	}

	.supercomics-panels {
		position: absolute;
		inset: 18% 10% 16% 10%;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		grid-template-rows: 1fr 1fr;
		gap: 0.55rem;
	}

	.supercomics-panels__panel {
		display: block;
		border: 1px solid rgb(255 255 255 / 16%);
		border-radius: 1.05rem;
		background: rgb(255 255 255 / 12%);
		backdrop-filter: blur(4px);
	}

	.supercomics-panels__panel--one {
		grid-row: 1 / span 2;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0%), rgb(255 255 255 / 12%)),
			linear-gradient(160deg, rgb(255 189 56 / 88%), rgb(255 93 145 / 72%));
		transform: rotate(-4deg);
	}

	.supercomics-panels__panel--two {
		background: linear-gradient(135deg, rgb(67 245 222 / 82%), rgb(255 255 255 / 18%));
		transform: rotate(3deg);
	}

	.supercomics-panels__panel--three {
		background: linear-gradient(135deg, rgb(255 255 255 / 15%), rgb(21 10 76 / 28%));
		transform: rotate(-2deg);
	}

	.supercomics-burst {
		position: absolute;
		right: 10%;
		bottom: 10%;
		width: 4.4rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(255 255 255 / 88%) 0 28%, rgb(255 255 255 / 0%) 30%);
		box-shadow: 0 0 0 1px rgb(255 255 255 / 12%);
	}

	.supercomics-dot {
		position: absolute;
		display: block;
		border-radius: 999px;
		background: rgb(255 255 255 / 22%);
	}

	.supercomics-dot--one {
		top: 22%;
		right: 14%;
		width: 1rem;
		height: 1rem;
	}

	.supercomics-dot--two {
		right: 23%;
		bottom: 25%;
		width: 0.55rem;
		height: 0.55rem;
	}
</style>
