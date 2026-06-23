import { afterEach, describe, expect, it, vi } from 'vitest';
import { runAfterInitialPaint } from './after-paint';

/**
 * Install a controllable `requestAnimationFrame` on a stubbed `window`: frames
 * don't fire on their own — call `flushNextFrame()` to run the earliest pending
 * one. This lets the tests step through the double-rAF schedule deterministically.
 */
function installControllableRaf() {
	const pendingFrames = new Map<number, FrameRequestCallback>();
	let nextFrameId = 1;

	const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
		const id = nextFrameId++;
		pendingFrames.set(id, callback);
		return id;
	});
	const cancelAnimationFrame = vi.fn((id: number) => {
		pendingFrames.delete(id);
	});

	vi.stubGlobal('window', { requestAnimationFrame, cancelAnimationFrame });

	return {
		cancelAnimationFrame,
		pendingFrameCount: () => pendingFrames.size,
		flushNextFrame() {
			const next = pendingFrames.entries().next().value;
			if (!next) return;
			const [id, callback] = next;
			pendingFrames.delete(id);
			callback(0);
		}
	};
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('runAfterInitialPaint', () => {
	it('invokes the callback only after a second animation frame', () => {
		const raf = installControllableRaf();
		const callback = vi.fn();

		runAfterInitialPaint(callback);
		raf.flushNextFrame(); // first frame schedules the second
		expect(callback).not.toHaveBeenCalled();

		raf.flushNextFrame(); // second frame runs the callback
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('does not invoke the callback when cancelled before the second frame', () => {
		const raf = installControllableRaf();
		const callback = vi.fn();

		const cancel = runAfterInitialPaint(callback);
		raf.flushNextFrame(); // first frame
		cancel();
		raf.flushNextFrame(); // would be the second frame

		expect(callback).not.toHaveBeenCalled();
	});

	it('cancels both scheduled frames on cancel', () => {
		const raf = installControllableRaf();

		const cancel = runAfterInitialPaint(vi.fn());
		raf.flushNextFrame(); // run first frame so the second id is also assigned
		cancel();

		expect(raf.cancelAnimationFrame).toHaveBeenCalledTimes(2);
		expect(raf.pendingFrameCount()).toBe(0);
	});
});
