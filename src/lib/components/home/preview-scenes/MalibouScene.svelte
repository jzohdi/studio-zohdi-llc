<!-- Decorative placeholder "scene" for the malibou preview variant. -->
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

<style>
	.scene {
		position: relative;
		width: 100%;
		height: 100%;
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
</style>
