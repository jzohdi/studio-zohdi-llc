<!-- Decorative placeholder "scene" for the heysimon preview variant. -->
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

<style>
	.scene {
		position: relative;
		width: 100%;
		height: 100%;
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
</style>
