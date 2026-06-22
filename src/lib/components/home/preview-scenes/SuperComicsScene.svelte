<!-- Decorative placeholder "scene" for the supercomics preview variant. -->
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

<style>
	.scene {
		position: relative;
		width: 100%;
		height: 100%;
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
