<!-- Decorative placeholder "scene" for the osol preview variant. -->
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

<style>
	.scene {
		position: relative;
		width: 100%;
		height: 100%;
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
</style>
