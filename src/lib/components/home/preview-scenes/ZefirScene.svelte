<!-- Decorative placeholder "scene" for the zefir preview variant. -->
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

<style>
	.scene {
		position: relative;
		width: 100%;
		height: 100%;
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
</style>
