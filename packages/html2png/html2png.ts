import { Resvg, initWasm } from '@resvg/resvg-wasm';
// import fs from 'node:fs/promises';
// import { Resvg } from '@resvg/resvg-js';

import satori, { SatoriOptions } from 'satori';
import type { html } from 'satori-html';
/* ========================================================================== */

// FIXME: Top level await bug
let inited = false;
async function init() {
	await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));
	inited = true;
}
export function toBase64URL(buffer: Uint8Array) {
	const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
	return url;
}

export async function html2png({
	markup,
	fonts,
	width = 1200,
	height = 630,
	objectURL = false,
}: {
	markup: ReturnType<typeof html>;
	fonts?: SatoriOptions['fonts'];
	width?: number;
	height?: number;
	objectURL?: boolean;
}) {
	if (!inited) await init();

	const m = markup as React.ReactNode; // Why assert?
	const svg = await satori(m, {
		width,
		height,
		//
		fonts: fonts ?? [
			{
				name: 'Roboto',
				data:
					// await fs.readFile('./SourceSans3-Regular.otf.woff'),
					await fetch(
						'http://localhost:3000/open-sans-all-400-normal.woff',
					).then((r) => r.arrayBuffer()),
				weight: 400,
				style: 'normal',
			},
		],
	});

	const opts = {
		// ...
	};
	const resvg = new Resvg(svg, opts);
	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	return {
		png: pngBuffer,
		svg,

		url: objectURL ? toBase64URL(pngBuffer) : undefined,

		responses: {
			png: [
				pngBuffer,
				{
					status: 200,
					headers: {
						'Content-Type': 'image/png',
					},
				},
			] as const,
			svg: [
				svg,
				{
					status: 200,
					headers: {
						'Content-Type': 'image/svg',
					},
				},
			] as const,
		},
	};
}
