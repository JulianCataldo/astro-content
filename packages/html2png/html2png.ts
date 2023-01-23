/* NOTE: Could offer the option to speed things up with native lib. */
// import { Resvg } from '@resvg/resvg-js';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import satori, { SatoriOptions } from 'satori';
import type { html } from 'satori-html';
/* ========================================================================== */

// FIXME: Top level await bug?
let inited = false;
async function init() {
	/* NODE */
	if (typeof process === 'object') {
		const fs = await import('fs/promises');
		const path = await import('path');
		const p = path.join(
			process.cwd(),
			'./node_modules/@resvg/resvg-wasm/index_bg.wasm',
		);
		const m = await fs.readFile(p);
		await initWasm(m);
		inited = true;
	} else if (typeof window === 'object') {
		/* BROWSER */
		/* NOTE: Could be sourced from public, Vite URL, etc. */
		await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));
		inited = true;
	}
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
}: {
	markup: ReturnType<typeof html>;
	fonts?: SatoriOptions['fonts'];
	width?: number;
	height?: number;
}) {
	if (!inited) await init();

	const m = markup as React.ReactNode; // Why assert?
	const svg = await satori(m, {
		width,
		height,
		//
		fonts: fonts ?? /* Fallback to basic font */ [
			{
				name: 'Roboto',
				data:
					/* Alternative methods… */
					// await import(
					// 	'/node_modules/@fontsource/open-sans/files/open-sans-all-400-normal.woff?raw'
					// ),
					// await fs.readFile('./SourceSans3-Regular.otf.woff'),
					// await fetch(
					// 	'http://localhost:3000/SourceSans3-Regular.otf.woff',
					// ).then((r) => r.arrayBuffer()),
					await fetch(
						'https://unpkg.com/typeface-source-sans-pro@1.1.13/files/source-sans-pro-400.woff',
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
