import { describe, expect, it } from 'vitest';
import { buildRevealChunks, countRevealWords } from './text-generate-reveal';

function getWordPieces(chunk: ReturnType<typeof buildRevealChunks>[number]) {
	return chunk.segments.flatMap((segment) =>
		segment.pieces.filter((piece) => piece.kind === 'word')
	);
}

describe('text-generate-reveal parsing', () => {
	it('turns inline anchors into renderable link chunks with safe attributes', () => {
		const chunks = buildRevealChunks(
			'Victims lost <a href="https://example.com/story" target="_blank" rel="noreferrer noopener" aria-label="Read the story">billions of dollars</a> quickly.'
		);

		const linkChunk = chunks.find((chunk) => chunk.kind === 'link');

		expect(linkChunk).toMatchObject({
			kind: 'link',
			attributes: {
				href: 'https://example.com/story',
				target: '_blank',
				rel: 'noreferrer noopener',
				'aria-label': 'Read the story'
			}
		});

		if (!linkChunk || linkChunk.kind !== 'link') {
			throw new Error('Expected a link chunk');
		}

		expect(linkChunk.segments).toHaveLength(1);
		expect(linkChunk.segments[0]?.strong).toBe(false);
		expect(getWordPieces(linkChunk)).toEqual([
			{ kind: 'word', text: 'billions', wordIndex: 2 },
			{ kind: 'word', text: 'of', wordIndex: 3 },
			{ kind: 'word', text: 'dollars', wordIndex: 4 }
		]);
	});

	it('tracks strong segments without counting markup as words', () => {
		const chunks = buildRevealChunks('Read <strong>important updates</strong> now.');

		expect(chunks).toHaveLength(1);

		const [textChunk] = chunks;

		if (!textChunk || textChunk.kind !== 'text') {
			throw new Error('Expected a text chunk');
		}

		expect(textChunk.segments.map((segment) => segment.strong)).toEqual([false, true, false]);
		expect(getWordPieces(textChunk)).toEqual([
			{ kind: 'word', text: 'Read', wordIndex: 0 },
			{ kind: 'word', text: 'important', wordIndex: 1 },
			{ kind: 'word', text: 'updates', wordIndex: 2 },
			{ kind: 'word', text: 'now.', wordIndex: 3 }
		]);
		expect(countRevealWords('Read <strong>important updates</strong> now.')).toBe(4);
	});

	it('preserves nested strong markup inside links while keeping word timing stable', () => {
		const chunks = buildRevealChunks(
			'Visit <a href="/report">the <strong>latest report</strong></a> tonight.'
		);

		const linkChunk = chunks.find((chunk) => chunk.kind === 'link');

		if (!linkChunk || linkChunk.kind !== 'link') {
			throw new Error('Expected a link chunk');
		}

		expect(linkChunk.attributes).toEqual({ href: '/report' });
		expect(linkChunk.segments.map((segment) => segment.strong)).toEqual([false, true]);
		expect(getWordPieces(linkChunk)).toEqual([
			{ kind: 'word', text: 'the', wordIndex: 1 },
			{ kind: 'word', text: 'latest', wordIndex: 2 },
			{ kind: 'word', text: 'report', wordIndex: 3 }
		]);
		expect(
			countRevealWords('Visit <a href="/report">the <strong>latest report</strong></a> tonight.')
		).toBe(5);
	});

	it('counts visible words while ignoring anchor markup and unsafe hrefs', () => {
		expect(
			countRevealWords('Read <a href="/report" data-source="press">the report</a> before trading.')
		).toBe(5);

		expect(
			buildRevealChunks('Avoid <a href="javascript:alert(1)">this</a> link.')
		).not.toContainEqual(expect.objectContaining({ kind: 'link' }));
	});
});
