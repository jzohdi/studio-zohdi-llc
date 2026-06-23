export function runAfterInitialPaint(callback: () => void): () => void {
	let cancelled = false;
	let firstFrameId = 0;
	let secondFrameId = 0;

	firstFrameId = window.requestAnimationFrame(() => {
		secondFrameId = window.requestAnimationFrame(() => {
			if (!cancelled) {
				callback();
			}
		});
	});

	return () => {
		cancelled = true;
		window.cancelAnimationFrame(firstFrameId);
		window.cancelAnimationFrame(secondFrameId);
	};
}
