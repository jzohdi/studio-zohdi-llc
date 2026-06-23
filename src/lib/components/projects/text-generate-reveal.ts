export type RevealPiece =
	| {
			kind: 'space';
			text: string;
	  }
	| {
			kind: 'word';
			text: string;
			wordIndex: number;
	  };

export type RevealSegment = {
	strong: boolean;
	pieces: RevealPiece[];
};

export type RevealChunk =
	| {
			kind: 'text';
			segments: RevealSegment[];
	  }
	| {
			kind: 'link';
			segments: RevealSegment[];
			attributes: Record<string, string>;
	  };

const anchorAttributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const supportedAnchorAttributes = new Set([
	'download',
	'href',
	'hreflang',
	'id',
	'referrerpolicy',
	'rel',
	'target',
	'title',
	'type'
]);

function isSupportedAnchorAttribute(name: string) {
	return (
		supportedAnchorAttributes.has(name) || name.startsWith('aria-') || name.startsWith('data-')
	);
}

function normalizeHref(value: string): string | null {
	const trimmed = value.trim();

	if (!trimmed) {
		return null;
	}

	if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
		return null;
	}

	return trimmed;
}

function parseAnchorAttributes(source: string) {
	const attributes: Record<string, string> = {};
	anchorAttributePattern.lastIndex = 0;

	let match: RegExpExecArray | null;

	while ((match = anchorAttributePattern.exec(source)) !== null) {
		const name = match[1]?.toLowerCase();

		if (!name || !isSupportedAnchorAttribute(name)) {
			continue;
		}

		const value = match[2] ?? match[3] ?? match[4] ?? '';

		if (name === 'href') {
			const href = normalizeHref(value);

			if (href) {
				attributes.href = href;
			}

			continue;
		}

		attributes[name] = value;
	}

	return attributes;
}

function tokenizeText(text: string, startingWordIndex: number) {
	const pieces: RevealPiece[] = [];
	let nextWordIndex = startingWordIndex;

	for (const part of text.split(/(\s+)/).filter(Boolean)) {
		if (/^\s+$/.test(part)) {
			pieces.push({ kind: 'space', text: part });
			continue;
		}

		pieces.push({ kind: 'word', text: part, wordIndex: nextWordIndex });
		nextWordIndex += 1;
	}

	return { pieces, nextWordIndex };
}

type InlineNode =
	| {
			kind: 'text';
			text: string;
	  }
	| {
			kind: 'strong';
			children: InlineNode[];
	  }
	| {
			kind: 'link';
			attributes: Record<string, string>;
			children: InlineNode[];
	  };

type ParsedTag = {
	raw: string;
	name: string;
	closing: boolean;
	attributesSource: string;
};

type RevealRun = {
	text: string;
	strong: boolean;
	linkAttributes: Record<string, string> | null;
};

function readTag(text: string, startIndex: number): ParsedTag | null {
	if (text[startIndex] !== '<') {
		return null;
	}

	let cursor = startIndex + 1;
	let closing = false;

	if (text[cursor] === '/') {
		closing = true;
		cursor += 1;
	}

	const nameStart = cursor;

	while (cursor < text.length && /[a-z]/i.test(text[cursor] ?? '')) {
		cursor += 1;
	}

	if (cursor === nameStart) {
		return null;
	}

	const name = text.slice(nameStart, cursor).toLowerCase();

	if (closing) {
		while (cursor < text.length && /\s/.test(text[cursor] ?? '')) {
			cursor += 1;
		}

		if (text[cursor] !== '>') {
			return null;
		}

		return {
			raw: text.slice(startIndex, cursor + 1),
			name,
			closing: true,
			attributesSource: ''
		};
	}

	const attributeStart = cursor;
	let activeQuote: '"' | "'" | null = null;

	while (cursor < text.length) {
		const character = text[cursor];

		if (activeQuote) {
			if (character === activeQuote) {
				activeQuote = null;
			}

			cursor += 1;
			continue;
		}

		if (character === '"' || character === "'") {
			activeQuote = character;
			cursor += 1;
			continue;
		}

		if (character === '>') {
			return {
				raw: text.slice(startIndex, cursor + 1),
				name,
				closing: false,
				attributesSource: text.slice(attributeStart, cursor)
			};
		}

		cursor += 1;
	}

	return null;
}

function parseInlineNodes(
	text: string,
	startIndex = 0,
	stopTag?: 'a' | 'strong'
): { nodes: InlineNode[]; nextIndex: number; closed: boolean } {
	const nodes: InlineNode[] = [];
	let buffer = '';
	let cursor = startIndex;

	const flushBuffer = () => {
		if (!buffer) {
			return;
		}

		nodes.push({ kind: 'text', text: buffer });
		buffer = '';
	};

	while (cursor < text.length) {
		if (text[cursor] !== '<') {
			buffer += text[cursor];
			cursor += 1;
			continue;
		}

		const tag = readTag(text, cursor);

		if (!tag) {
			buffer += text[cursor];
			cursor += 1;
			continue;
		}

		if (tag.closing) {
			if (tag.name === stopTag) {
				flushBuffer();
				return { nodes, nextIndex: cursor + tag.raw.length, closed: true };
			}

			buffer += tag.raw;
			cursor += tag.raw.length;
			continue;
		}

		if (tag.name === 'strong' && tag.attributesSource.trim() === '') {
			const nested = parseInlineNodes(text, cursor + tag.raw.length, 'strong');

			if (nested.closed) {
				flushBuffer();
				nodes.push({ kind: 'strong', children: nested.nodes });
				cursor = nested.nextIndex;
				continue;
			}
		}

		if (tag.name === 'a') {
			const nested = parseInlineNodes(text, cursor + tag.raw.length, 'a');

			if (nested.closed) {
				flushBuffer();

				const attributes = parseAnchorAttributes(tag.attributesSource);

				if (attributes.href) {
					nodes.push({ kind: 'link', attributes, children: nested.nodes });
				} else {
					nodes.push(...nested.nodes);
				}

				cursor = nested.nextIndex;
				continue;
			}
		}

		buffer += tag.raw;
		cursor += tag.raw.length;
	}

	flushBuffer();

	return { nodes, nextIndex: cursor, closed: false };
}

function pushRun(
	runs: RevealRun[],
	text: string,
	strong: boolean,
	linkAttributes: Record<string, string> | null
) {
	if (!text) {
		return;
	}

	const previousRun = runs.at(-1);

	if (
		previousRun &&
		previousRun.strong === strong &&
		previousRun.linkAttributes === linkAttributes
	) {
		previousRun.text += text;
		return;
	}

	runs.push({ text, strong, linkAttributes });
}

function collectRevealRuns(
	nodes: InlineNode[],
	context: { strong: boolean; linkAttributes: Record<string, string> | null },
	runs: RevealRun[]
) {
	for (const node of nodes) {
		if (node.kind === 'text') {
			pushRun(runs, node.text, context.strong, context.linkAttributes);
			continue;
		}

		if (node.kind === 'strong') {
			collectRevealRuns(node.children, { ...context, strong: true }, runs);
			continue;
		}

		collectRevealRuns(node.children, { ...context, linkAttributes: node.attributes }, runs);
	}
}

function appendSegment(segments: RevealSegment[], strong: boolean, pieces: RevealPiece[]) {
	if (pieces.length === 0) {
		return;
	}

	const previousSegment = segments.at(-1);

	if (previousSegment && previousSegment.strong === strong) {
		previousSegment.pieces.push(...pieces);
		return;
	}

	segments.push({ strong, pieces: [...pieces] });
}

function finalizeChunk(
	kind: RevealChunk['kind'],
	segments: RevealSegment[],
	attributes: Record<string, string> | null
): RevealChunk | null {
	if (segments.length === 0) {
		return null;
	}

	if (kind === 'link' && attributes) {
		return { kind: 'link', segments, attributes };
	}

	return { kind: 'text', segments };
}

export function buildRevealChunks(text: string): RevealChunk[] {
	const parsed = parseInlineNodes(text);
	const runs: RevealRun[] = [];
	const chunks: RevealChunk[] = [];
	let currentKind: RevealChunk['kind'] | null = null;
	let currentAttributes: Record<string, string> | null = null;
	let currentSegments: RevealSegment[] = [];
	let nextWordIndex = 0;

	collectRevealRuns(parsed.nodes, { strong: false, linkAttributes: null }, runs);

	for (const run of runs) {
		const nextKind: RevealChunk['kind'] = run.linkAttributes ? 'link' : 'text';

		if (currentKind && (currentKind !== nextKind || currentAttributes !== run.linkAttributes)) {
			const completedChunk = finalizeChunk(currentKind, currentSegments, currentAttributes);

			if (completedChunk) {
				chunks.push(completedChunk);
			}

			currentSegments = [];
			currentAttributes = null;
			currentKind = null;
		}

		if (!currentKind) {
			currentKind = nextKind;
			currentAttributes = run.linkAttributes;
		}

		const tokenized = tokenizeText(run.text, nextWordIndex);
		appendSegment(currentSegments, run.strong, tokenized.pieces);
		nextWordIndex = tokenized.nextWordIndex;
	}

	const trailingChunk = currentKind
		? finalizeChunk(currentKind, currentSegments, currentAttributes)
		: null;

	if (trailingChunk) {
		chunks.push(trailingChunk);
	}

	return chunks;
}

export function countRevealWords(text: string) {
	return buildRevealChunks(text).reduce(
		(total, chunk) =>
			total +
			chunk.segments.reduce(
				(segmentTotal, segment) =>
					segmentTotal + segment.pieces.filter((piece) => piece.kind === 'word').length,
				0
			),
		0
	);
}
