<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { Attachment } from 'svelte/attachments';

	interface Props {
		/** Accessible description, surfaced by the parent tile's `aria-label`. */
		label?: string;
	}

	let { label = '' }: Props = $props();

	const prefersReducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', true);

	type Rgb = readonly [number, number, number];

	type Particle = {
		angle: number;
		radius: number;
		speed: number;
		size: number;
		kind: 'attack' | 'legit';
		alpha: number;
	};

	type Impact = { angle: number; radius: number; alpha: number };

	// Saturated mid-tones so the graphic reads on both light and dark surfaces.
	const COLOR = {
		attack: [248, 113, 113] as Rgb,
		legit: [45, 212, 191] as Rgb,
		barrier: [168, 85, 247] as Rgb,
		core: [124, 58, 237] as Rgb
	};

	function rgba(color: Rgb, alpha: number): string {
		return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
	}

	const renderDdos: Attachment<HTMLCanvasElement> = (canvas) => {
		const context = canvas.getContext('2d');

		if (!context) {
			return;
		}

		const ctx = context;
		const reduceMotion = prefersReducedMotion.current;

		let width = 0;
		let height = 0;
		let centerX = 0;
		let centerY = 0;
		let coreRadius = 0;
		let barrierRadius = 0;
		let spawnRadius = 0;
		let speedScale = 1;

		const particles: Particle[] = [];
		const impacts: Impact[] = [];
		let coreFlash = 0;

		function measure() {
			const rect = canvas.getBoundingClientRect();
			width = Math.max(1, rect.width);
			height = Math.max(1, rect.height);
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			centerX = width / 2;
			centerY = height / 2;
			const minSide = Math.min(width, height);
			coreRadius = minSide * 0.1;
			barrierRadius = minSide * 0.27;
			spawnRadius = Math.hypot(width, height) / 2 + minSide * 0.06;
			speedScale = minSide * 0.0065;
		}

		function spawnParticle() {
			const isLegit = Math.random() < 0.16;
			particles.push({
				angle: Math.random() * Math.PI * 2,
				radius: spawnRadius,
				speed: (isLegit ? 0.85 : 1) * (1.1 + Math.random() * 1.5),
				size: isLegit ? 2.6 : 1.5 + Math.random() * 2,
				kind: isLegit ? 'legit' : 'attack',
				alpha: isLegit ? 0.92 : 0.82
			});
		}

		function drawParticle(particle: Particle) {
			const cos = Math.cos(particle.angle);
			const sin = Math.sin(particle.angle);
			const x = centerX + cos * particle.radius;
			const y = centerY + sin * particle.radius;
			const trail = particle.size * 6;
			const color = particle.kind === 'attack' ? COLOR.attack : COLOR.legit;

			ctx.lineCap = 'round';
			ctx.lineWidth = particle.size;
			ctx.strokeStyle = rgba(color, particle.alpha * 0.32);
			ctx.beginPath();
			ctx.moveTo(
				centerX + cos * (particle.radius + trail),
				centerY + sin * (particle.radius + trail)
			);
			ctx.lineTo(x, y);
			ctx.stroke();

			ctx.fillStyle = rgba(color, particle.alpha);
			ctx.beginPath();
			ctx.arc(x, y, particle.size, 0, Math.PI * 2);
			ctx.fill();
		}

		function drawImpact(impact: Impact) {
			const x = centerX + Math.cos(impact.angle) * barrierRadius;
			const y = centerY + Math.sin(impact.angle) * barrierRadius;
			ctx.lineWidth = Math.max(1, barrierRadius * 0.04);
			ctx.strokeStyle = rgba(COLOR.attack, impact.alpha);
			ctx.beginPath();
			ctx.arc(x, y, impact.radius, 0, Math.PI * 2);
			ctx.stroke();
		}

		function drawBarrier(time: number) {
			const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(time * 2);

			ctx.lineWidth = Math.max(1.5, barrierRadius * 0.05);
			ctx.strokeStyle = rgba(COLOR.barrier, 0.16 + pulse * 0.16);
			ctx.beginPath();
			ctx.arc(centerX, centerY, barrierRadius, 0, Math.PI * 2);
			ctx.stroke();

			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(reduceMotion ? 0 : time * 0.5);
			ctx.setLineDash([barrierRadius * 0.2, barrierRadius * 0.16]);
			ctx.lineWidth = Math.max(1.5, barrierRadius * 0.045);
			ctx.strokeStyle = rgba(COLOR.barrier, 0.62);
			ctx.beginPath();
			ctx.arc(0, 0, barrierRadius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
			ctx.setLineDash([]);
		}

		function drawCore(time: number) {
			const pulse = reduceMotion ? 0.6 : 0.55 + 0.45 * Math.sin(time * 2.4);
			const glowRadius = coreRadius * (2.1 + pulse * 0.6) + coreFlash * coreRadius * 1.4;

			const glow = ctx.createRadialGradient(
				centerX,
				centerY,
				coreRadius * 0.2,
				centerX,
				centerY,
				glowRadius
			);
			glow.addColorStop(0, rgba(COLOR.core, 0.45));
			glow.addColorStop(1, rgba(COLOR.core, 0));
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = rgba(COLOR.core, 0.96);
			ctx.beginPath();
			ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
			ctx.fill();

			ctx.lineWidth = Math.max(1.5, coreRadius * 0.12);
			ctx.strokeStyle = rgba(COLOR.barrier, 0.9);
			ctx.beginPath();
			ctx.arc(centerX, centerY, coreRadius * 1.28, 0, Math.PI * 2);
			ctx.stroke();

			drawShield();
		}

		function drawShield() {
			const s = coreRadius * 0.82;
			ctx.save();
			ctx.translate(centerX, centerY);

			ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
			ctx.beginPath();
			ctx.moveTo(0, -s);
			ctx.lineTo(s * 0.78, -s * 0.46);
			ctx.lineTo(s * 0.78, s * 0.16);
			ctx.quadraticCurveTo(s * 0.78, s * 0.82, 0, s);
			ctx.quadraticCurveTo(-s * 0.78, s * 0.82, -s * 0.78, s * 0.16);
			ctx.lineTo(-s * 0.78, -s * 0.46);
			ctx.closePath();
			ctx.fill();

			ctx.strokeStyle = rgba(COLOR.core, 1);
			ctx.lineWidth = s * 0.18;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(-s * 0.34, -s * 0.02);
			ctx.lineTo(-s * 0.08, s * 0.28);
			ctx.lineTo(s * 0.4, -s * 0.32);
			ctx.stroke();

			ctx.restore();
		}

		function step() {
			ctx.clearRect(0, 0, width, height);
			drawBarrier(performance.now() / 1000);

			for (let i = particles.length - 1; i >= 0; i--) {
				const particle = particles[i];
				particle.radius -= particle.speed * speedScale;

				if (particle.kind === 'attack' && particle.radius <= barrierRadius) {
					impacts.push({ angle: particle.angle, radius: 0, alpha: 0.85 });
					particles.splice(i, 1);
					continue;
				}

				if (particle.kind === 'legit' && particle.radius <= coreRadius * 0.85) {
					coreFlash = 1;
					particles.splice(i, 1);
					continue;
				}

				drawParticle(particle);
			}

			for (let i = impacts.length - 1; i >= 0; i--) {
				const impact = impacts[i];
				impact.radius += speedScale * 1.5;
				impact.alpha -= 0.035;

				if (impact.alpha <= 0) {
					impacts.splice(i, 1);
					continue;
				}

				drawImpact(impact);
			}

			drawCore(performance.now() / 1000);
			coreFlash = Math.max(0, coreFlash - 0.05);
		}

		function renderStatic() {
			particles.length = 0;
			impacts.length = 0;

			for (let i = 0; i < 11; i++) {
				const ring = i % 3;
				particles.push({
					angle: (i / 11) * Math.PI * 2 + 0.35,
					radius: barrierRadius + barrierRadius * (0.5 + ring * 0.6),
					speed: 0,
					size: 2.2,
					kind: 'attack',
					alpha: 0.8
				});
			}

			particles.push({
				angle: 0.9,
				radius: coreRadius + (barrierRadius - coreRadius) * 0.5,
				speed: 0,
				size: 2.6,
				kind: 'legit',
				alpha: 0.9
			});

			ctx.clearRect(0, 0, width, height);
			drawBarrier(0);
			for (const particle of particles) {
				drawParticle(particle);
			}
			for (let i = 0; i < 5; i++) {
				drawImpact({ angle: (i / 5) * Math.PI * 2, radius: barrierRadius * 0.12, alpha: 0.5 });
			}
			drawCore(0);
		}

		measure();

		let visible = true;
		const intersectionObserver =
			typeof IntersectionObserver !== 'undefined'
				? new IntersectionObserver(
						(entries) => {
							visible = entries.some((entry) => entry.isIntersecting);
						},
						{ threshold: 0.04 }
					)
				: null;
		intersectionObserver?.observe(canvas);

		const resizeObserver = new ResizeObserver(() => {
			measure();
			if (reduceMotion) {
				renderStatic();
			}
		});
		resizeObserver.observe(canvas);

		if (reduceMotion) {
			renderStatic();

			return () => {
				intersectionObserver?.disconnect();
				resizeObserver.disconnect();
			};
		}

		let spawnAccumulator = 0;
		let last = performance.now();
		const spawnInterval = 85;

		let frameId = requestAnimationFrame(function animate() {
			frameId = requestAnimationFrame(animate);

			const now = performance.now();
			const delta = Math.min(now - last, 50);
			last = now;

			if (!visible) {
				return;
			}

			spawnAccumulator += delta;
			while (spawnAccumulator >= spawnInterval) {
				spawnParticle();
				spawnAccumulator -= spawnInterval;
			}

			step();
		});

		return () => {
			cancelAnimationFrame(frameId);
			intersectionObserver?.disconnect();
			resizeObserver.disconnect();
		};
	};
</script>

<div class="ddos" role="img" aria-label={label}>
	<canvas class="ddos__canvas" {@attach renderDdos} aria-hidden="true"></canvas>
</div>

<style>
	.ddos {
		position: relative;
		display: block;
		height: 100%;
		min-height: clamp(16rem, 26vw, 20rem);
		background: transparent;
	}

	.ddos__canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
