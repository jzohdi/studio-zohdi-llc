/**
 * Format the carousel position indicator shown beneath the desktop preview,
 * e.g. scene 1 of 7 -> "01 / 07". Both numbers are 1-based and zero-padded to
 * at least two digits.
 */
export function formatSceneCounter(activeSceneIndex: number, sceneCount: number): string {
	const current = (activeSceneIndex + 1).toString().padStart(2, '0');
	const total = sceneCount.toString().padStart(2, '0');
	return `${current} / ${total}`;
}
