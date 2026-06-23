<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { Attachment } from 'svelte/attachments';

	interface Props {
		title: string;
	}

	let { title }: Props = $props();

	const prefersReducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', true);

	type ArcDatum = {
		order: number;
		startLat: number;
		startLng: number;
		endLat: number;
		endLng: number;
		arcAlt: number;
		color: string;
	};

	type PointDatum = { lat: number; lng: number; color: string };

	// A deliberately small set of hubs (a few in the US, Europe, and Asia) so the
	// globe stays clean and legible rather than busy, as requested.
	const cities = {
		london: { lat: 51.5072, lng: -0.1276 },
		oslo: { lat: 59.9139, lng: 10.7522 },
		hongKong: { lat: 22.3193, lng: 114.1694 },
		taipei: { lat: 25.033, lng: 121.5654 },
		shanghai: { lat: 31.2304, lng: 121.4737 },
		newYork: { lat: 40.7128, lng: -74.006 },
		miami: { lat: 25.7617, lng: -80.1918 },
		losAngeles: { lat: 34.0522, lng: -118.2437 }
	} as const;

	// Saturated violets so the arcs stay visible over both the dark globe surface
	// and a light page background.
	const arcColors = ['#7c3aed', '#a855f7', '#9333ea'];

	// One connected network — every city is linked into the graph, no duplicate pairs.
	const connections: Array<{ from: keyof typeof cities; to: keyof typeof cities; alt: number }> = [
		{ from: 'newYork', to: 'london', alt: 0.32 },
		{ from: 'miami', to: 'newYork', alt: 0.12 },
		{ from: 'losAngeles', to: 'newYork', alt: 0.2 },
		{ from: 'losAngeles', to: 'taipei', alt: 0.52 },
		{ from: 'london', to: 'oslo', alt: 0.14 },
		{ from: 'london', to: 'hongKong', alt: 0.46 },
		{ from: 'hongKong', to: 'taipei', alt: 0.14 },
		{ from: 'taipei', to: 'shanghai', alt: 0.16 },
		{ from: 'shanghai', to: 'oslo', alt: 0.44 }
	];

	const arcs: ArcDatum[] = connections.map((connection, index) => ({
		order: index + 1,
		startLat: cities[connection.from].lat,
		startLng: cities[connection.from].lng,
		endLat: cities[connection.to].lat,
		endLng: cities[connection.to].lng,
		arcAlt: connection.alt,
		color: arcColors[index % arcColors.length]
	}));

	const points: PointDatum[] = Object.values(cities).map((city) => ({
		lat: city.lat,
		lng: city.lng,
		color: '#efeaff'
	}));

	// Renders the three-globe scene into the attached element. three.js and the
	// country polygons are imported lazily so they stay out of the main bundle
	// and never run during SSR.
	const renderGlobe: Attachment<HTMLDivElement> = (element) => {
		let disposed = false;
		let cleanup: (() => void) | undefined;

		void (async () => {
			const THREE = await import('three');
			const ThreeGlobe = (await import('three-globe')).default;
			const countries = (await import('./globe/countries.geo.json')).default as {
				features: object[];
			};

			if (disposed) {
				return;
			}

			const reduceMotion = prefersReducedMotion.current;

			const globe = new ThreeGlobe()
				.hexPolygonsData(countries.features)
				.hexPolygonResolution(3)
				.hexPolygonMargin(0.62)
				.hexPolygonUseDots(true)
				.hexPolygonColor(() => 'rgba(187, 156, 255, 0.85)')
				.showAtmosphere(true)
				.atmosphereColor('#b07cff')
				.atmosphereAltitude(0.18)
				.arcsData(arcs)
				.arcColor((datum: object) => (datum as ArcDatum).color)
				.arcAltitude((datum: object) => (datum as ArcDatum).arcAlt)
				.arcStroke(0.5)
				.arcDashLength(0.85)
				.arcDashGap(4)
				.arcDashInitialGap((datum: object) => (datum as ArcDatum).order)
				.arcDashAnimateTime(reduceMotion ? 0 : 2600)
				.pointsData(points)
				.pointColor((datum: object) => (datum as PointDatum).color)
				.pointAltitude(0.01)
				.pointRadius(0.7)
				.pointsMerge(true);

			const globeMaterial = globe.globeMaterial() as InstanceType<typeof THREE.MeshPhongMaterial>;
			globeMaterial.color = new THREE.Color('#170e34');
			globeMaterial.emissive = new THREE.Color('#241046');
			globeMaterial.emissiveIntensity = 0.18;
			globeMaterial.shininess = 0.8;

			const scene = new THREE.Scene();
			scene.add(globe);
			scene.add(new THREE.AmbientLight(0xbbbbff, 0.65));

			const keyLight = new THREE.DirectionalLight(0xa855f7, 1.2);
			keyLight.position.set(-220, 320, 220);
			scene.add(keyLight);

			const fillLight = new THREE.DirectionalLight(0x7c3aed, 0.8);
			fillLight.position.set(220, -140, 180);
			scene.add(fillLight);

			const measure = () => {
				const rect = element.getBoundingClientRect();
				return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
			};

			let { width, height } = measure();

			const camera = new THREE.PerspectiveCamera(50, width / height, 100, 2000);
			camera.position.z = 285;

			const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
			renderer.setSize(width, height);
			renderer.setClearColor(0x000000, 0);
			renderer.domElement.style.display = 'block';
			element.appendChild(renderer.domElement);

			// Nudge the globe down so the title has clear space above it.
			globe.position.y = -16;

			// Orient Eurasia toward the viewer so the active hubs are visible.
			globe.rotation.x = 0.16;
			globe.rotation.y = Math.PI / 3.4;

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
			intersectionObserver?.observe(element);

			const resizeObserver = new ResizeObserver(() => {
				const next = measure();
				width = next.width;
				height = next.height;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize(width, height);
			});
			resizeObserver.observe(element);

			let ringTimer: ReturnType<typeof setInterval> | undefined;

			if (!reduceMotion) {
				globe
					.ringColor(() => 'rgba(168, 85, 247, 0.45)')
					.ringMaxRadius(3)
					.ringPropagationSpeed(2.4)
					.ringRepeatPeriod(900);

				ringTimer = setInterval(() => {
					const pulse = points.filter(() => Math.random() > 0.45);
					globe.ringsData(pulse.length > 0 ? pulse : [points[0]]);
				}, 2200);
			}

			let frameId = requestAnimationFrame(function animate() {
				frameId = requestAnimationFrame(animate);

				if (!visible) {
					return;
				}

				if (!reduceMotion) {
					globe.rotation.y += 0.0016;
				}

				renderer.render(scene, camera);
			});

			cleanup = () => {
				cancelAnimationFrame(frameId);

				if (ringTimer) {
					clearInterval(ringTimer);
				}

				intersectionObserver?.disconnect();
				resizeObserver.disconnect();
				renderer.domElement.remove();
				renderer.dispose();
			};
		})();

		return () => {
			disposed = true;
			cleanup?.();
		};
	};
</script>

<div class="globe">
	<h3 class="globe__title">{title}</h3>
	<div class="globe__stage" {@attach renderGlobe} aria-hidden="true"></div>
</div>

<style>
	.globe {
		position: relative;
		display: block;
		height: 100%;
		min-height: clamp(18rem, 30vw, 24rem);
		background: transparent;
	}

	.globe__title {
		position: absolute;
		inset: clamp(0.4rem, 1.4vw, 0.9rem) clamp(0.4rem, 1.4vw, 0.9rem) auto;
		z-index: 1;
		max-width: 16ch;
		color: hsl(var(--foreground));
		font-family: var(--font-display);
		font-size: clamp(1.15rem, 1.9vw, 1.55rem);
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: -0.03em;
		text-wrap: balance;
		pointer-events: none;
	}

	.globe__stage {
		position: absolute;
		inset: 0;
		display: block;
	}

	.globe__stage :global(canvas) {
		width: 100% !important;
		height: 100% !important;
	}
</style>
