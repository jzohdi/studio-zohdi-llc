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

	/** A single filing card streaming up the feed. */
	type FeedRow = {
		/** Vertical position of the card's top edge, in CSS px. */
		y: number;
		/** Whether this filing is flagged as high-impact (it gets highlighted). */
		interesting: boolean;
		/** Accent dot color for ordinary rows. */
		dot: Rgb;
		/** Width fractions (0..1) for the two description lines. */
		lines: readonly [number, number];
		/** Width fraction for the ticker pill. */
		ticker: number;
		/** Phase offset so highlighted rows don't all pulse in lockstep. */
		phase: number;
	};

	// Saturated mid-tones tuned to read on the tile's light surface.
	const COLOR = {
		accent: [229, 42, 172] as Rgb, // site pink — flags the interesting filings
		ticker: [59, 130, 246] as Rgb,
		teal: [20, 184, 166] as Rgb,
		amber: [217, 119, 6] as Rgb,
		text: [71, 85, 105] as Rgb,
		faint: [148, 163, 184] as Rgb,
		live: [239, 68, 68] as Rgb
	};

	const ORDINARY_DOTS: Rgb[] = [COLOR.ticker, COLOR.teal, COLOR.amber, COLOR.faint];

	function rgba(color: Rgb, alpha: number): string {
		return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
	}

	function roundedRect(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
		r: number
	) {
		const radius = Math.min(r, w / 2, h / 2);
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.arcTo(x + w, y, x + w, y + h, radius);
		ctx.arcTo(x + w, y + h, x, y + h, radius);
		ctx.arcTo(x, y + h, x, y, radius);
		ctx.arcTo(x, y, x + w, y, radius);
		ctx.closePath();
	}

	const renderLiveFeed: Attachment<HTMLCanvasElement> = (canvas) => {
		const context = canvas.getContext('2d');

		if (!context) {
			return;
		}

		const ctx = context;
		const reduceMotion = prefersReducedMotion.current;

		let width = 0;
		let height = 0;
		let padX = 0;
		let listTop = 0;
		let cardHeight = 0;
		let cardGap = 0;
		let speed = 0; // px per second
		let rowSeed = 0;

		const rows: FeedRow[] = [];

		function makeRow(y: number): FeedRow {
			rowSeed += 1;
			// Deterministic-ish pseudo randomness keeps neighbours visually distinct.
			const r = (n: number) => {
				const v = Math.sin((rowSeed + n) * 12.9898) * 43758.5453;
				return v - Math.floor(v);
			};

			return {
				y,
				interesting: r(1) < 0.32,
				dot: ORDINARY_DOTS[Math.floor(r(2) * ORDINARY_DOTS.length)] ?? COLOR.ticker,
				lines: [0.62 + r(3) * 0.32, 0.34 + r(4) * 0.34],
				ticker: 0.16 + r(5) * 0.12,
				phase: r(6) * Math.PI * 2
			};
		}

		function measure() {
			const rect = canvas.getBoundingClientRect();
			width = Math.max(1, rect.width);
			height = Math.max(1, rect.height);
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			padX = Math.max(14, width * 0.06);
			listTop = Math.max(30, height * 0.13);
			cardHeight = Math.min(74, Math.max(48, height * 0.2));
			cardGap = cardHeight * 0.24;
			speed = cardHeight * 0.55;
		}

		/** Keep the column filled from `listTop` down past the bottom edge. */
		function refill() {
			while (rows.length === 0 || lastBottom() < height + cardHeight) {
				const nextTop = rows.length === 0 ? listTop : lastBottom() + cardGap;
				rows.push(makeRow(nextTop));
			}
		}

		function lastBottom(): number {
			const last = rows[rows.length - 1];
			return last ? last.y + cardHeight : listTop;
		}

		function drawRow(row: FeedRow, time: number) {
			const x = padX;
			const w = width - padX * 2;
			const y = row.y;
			const radius = Math.min(16, cardHeight * 0.26);
			const pulse = reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(time * 2.4 + row.phase);

			if (row.interesting) {
				// Soft accent glow behind the flagged card.
				ctx.save();
				ctx.shadowColor = rgba(COLOR.accent, 0.32 + pulse * 0.18);
				ctx.shadowBlur = 22;
				roundedRect(ctx, x, y, w, cardHeight, radius);
				ctx.fillStyle = rgba(COLOR.accent, 0.1);
				ctx.fill();
				ctx.restore();

				roundedRect(ctx, x, y, w, cardHeight, radius);
				ctx.fillStyle = rgba(COLOR.accent, 0.07);
				ctx.fill();
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = rgba(COLOR.accent, 0.55 + pulse * 0.3);
				ctx.stroke();
			} else {
				roundedRect(ctx, x, y, w, cardHeight, radius);
				ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = rgba(COLOR.faint, 0.32);
				ctx.stroke();
			}

			const padIn = cardHeight * 0.26;
			const dotR = cardHeight * 0.11;
			const dotX = x + padIn + dotR;
			const dotY = y + cardHeight * 0.36;
			const dotColor = row.interesting ? COLOR.accent : row.dot;

			if (row.interesting && !reduceMotion) {
				// Expanding "new arrival" ping ring on the status dot.
				const ping = (time * 0.9 + row.phase / 6) % 1;
				ctx.beginPath();
				ctx.arc(dotX, dotY, dotR + ping * dotR * 2.4, 0, Math.PI * 2);
				ctx.strokeStyle = rgba(COLOR.accent, (1 - ping) * 0.5);
				ctx.lineWidth = 1.5;
				ctx.stroke();
			}

			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
			ctx.fillStyle = rgba(dotColor, row.interesting ? 0.95 : 0.85);
			ctx.fill();

			// Ticker pill next to the status dot.
			const barX = dotX + dotR + padIn * 0.7;
			const tickerW = w * row.ticker;
			const tickerH = cardHeight * 0.16;
			roundedRect(ctx, barX, dotY - tickerH / 2, tickerW, tickerH, tickerH / 2);
			ctx.fillStyle = rgba(dotColor, row.interesting ? 0.85 : 0.6);
			ctx.fill();

			// Two description lines.
			const lineH = cardHeight * 0.1;
			const lineY = y + cardHeight * 0.66;
			const maxLineW = w - (barX - x) - padIn;
			roundedRect(ctx, barX, lineY, maxLineW * row.lines[0], lineH, lineH / 2);
			ctx.fillStyle = rgba(COLOR.text, 0.3);
			ctx.fill();
			roundedRect(ctx, barX, lineY + lineH * 1.9, maxLineW * row.lines[1], lineH, lineH / 2);
			ctx.fillStyle = rgba(COLOR.faint, 0.4);
			ctx.fill();

			// Right edge: timestamp for ordinary rows, an "alert" badge for flagged ones.
			const rightX = x + w - padIn;
			if (row.interesting) {
				drawAlertBadge(rightX, y + cardHeight * 0.36, cardHeight * 0.18, pulse);
			} else {
				const stampW = w * 0.12;
				const stampH = cardHeight * 0.12;
				roundedRect(ctx, rightX - stampW, dotY - stampH / 2, stampW, stampH, stampH / 2);
				ctx.fillStyle = rgba(COLOR.faint, 0.45);
				ctx.fill();
			}
		}

		/** A small upward-trend chevron in a glowing accent pill. */
		function drawAlertBadge(cx: number, cy: number, size: number, pulse: number) {
			ctx.save();
			ctx.beginPath();
			ctx.arc(cx - size, cy, size, 0, Math.PI * 2);
			ctx.fillStyle = rgba(COLOR.accent, 0.16 + pulse * 0.14);
			ctx.fill();

			ctx.translate(cx - size, cy);
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.lineWidth = Math.max(1.4, size * 0.22);
			ctx.strokeStyle = rgba(COLOR.accent, 0.95);
			ctx.beginPath();
			ctx.moveTo(-size * 0.45, size * 0.32);
			ctx.lineTo(-size * 0.08, -size * 0.12);
			ctx.lineTo(size * 0.18, size * 0.12);
			ctx.lineTo(size * 0.5, -size * 0.34);
			ctx.stroke();
			// Arrow head.
			ctx.beginPath();
			ctx.moveTo(size * 0.5, -size * 0.34);
			ctx.lineTo(size * 0.2, -size * 0.36);
			ctx.moveTo(size * 0.5, -size * 0.34);
			ctx.lineTo(size * 0.48, -size * 0.04);
			ctx.stroke();
			ctx.restore();
		}

		/** "LIVE" pill with a pulsing dot, pinned to the top-left. */
		function drawLiveBadge(time: number) {
			const pulse = reduceMotion ? 0.7 : 0.5 + 0.5 * Math.sin(time * 3);
			const x = padX;
			const y = Math.max(8, listTop * 0.34);
			const h = Math.max(14, listTop * 0.42);
			const w = h * 2.6;

			roundedRect(ctx, x, y, w, h, h / 2);
			ctx.fillStyle = rgba(COLOR.live, 0.12);
			ctx.fill();

			const dotR = h * 0.16;
			const dotX = x + h * 0.5;
			const dotY = y + h / 2;
			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR + dotR * pulse * 1.6, 0, Math.PI * 2);
			ctx.fillStyle = rgba(COLOR.live, (1 - pulse) * 0.35);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
			ctx.fillStyle = rgba(COLOR.live, 0.95);
			ctx.fill();

			// "LIVE" wordmark as three short bars (kept resolution-agnostic).
			let bx = dotX + dotR + h * 0.28;
			const barW = h * 0.22;
			const barH = h * 0.34;
			for (let i = 0; i < 3; i++) {
				roundedRect(ctx, bx, dotY - barH / 2, barW, barH, 1.5);
				ctx.fillStyle = rgba(COLOR.live, 0.75);
				ctx.fill();
				bx += barW + h * 0.16;
			}
		}

		/** Erase the top and bottom edges so cards stream in and out of view. */
		function drawEdgeFades() {
			const fade = Math.min(cardHeight * 1.2, height * 0.28);
			ctx.globalCompositeOperation = 'destination-out';

			const top = ctx.createLinearGradient(0, listTop - cardGap, 0, listTop + fade);
			top.addColorStop(0, 'rgba(0, 0, 0, 1)');
			top.addColorStop(1, 'rgba(0, 0, 0, 0)');
			ctx.fillStyle = top;
			ctx.fillRect(0, listTop - cardGap, width, fade + cardGap);

			const bottom = ctx.createLinearGradient(0, height - fade, 0, height);
			bottom.addColorStop(0, 'rgba(0, 0, 0, 0)');
			bottom.addColorStop(1, 'rgba(0, 0, 0, 1)');
			ctx.fillStyle = bottom;
			ctx.fillRect(0, height - fade, width, fade);

			ctx.globalCompositeOperation = 'source-over';
		}

		function render(time: number) {
			ctx.clearRect(0, 0, width, height);

			for (const row of rows) {
				if (row.y > height || row.y + cardHeight < listTop - cardGap) {
					continue;
				}
				drawRow(row, time);
			}

			drawEdgeFades();
			drawLiveBadge(time);
		}

		measure();
		refill();

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
			refill();
			if (reduceMotion) {
				render(0);
			}
		});
		resizeObserver.observe(canvas);

		if (reduceMotion) {
			render(0);

			return () => {
				intersectionObserver?.disconnect();
				resizeObserver.disconnect();
			};
		}

		let last = performance.now();

		let frameId = requestAnimationFrame(function animate() {
			frameId = requestAnimationFrame(animate);

			const now = performance.now();
			const delta = Math.min(now - last, 50);
			last = now;

			if (!visible) {
				return;
			}

			const move = (speed * delta) / 1000;
			for (const row of rows) {
				row.y -= move;
			}

			// Recycle cards once they scroll above the fade-in line.
			while (rows.length > 0 && rows[0].y + cardHeight < listTop - cardGap) {
				rows.shift();
			}
			refill();

			render(now / 1000);
		});

		return () => {
			cancelAnimationFrame(frameId);
			intersectionObserver?.disconnect();
			resizeObserver.disconnect();
		};
	};
</script>

<div class="live-feed" role="img" aria-label={label}>
	<canvas class="live-feed__canvas" {@attach renderLiveFeed} aria-hidden="true"></canvas>
</div>

<style>
	.live-feed {
		position: relative;
		display: block;
		height: 100%;
		min-height: clamp(16rem, 26vw, 20rem);
		background: transparent;
	}

	.live-feed__canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
