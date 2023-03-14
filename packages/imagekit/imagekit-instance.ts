import fs from 'node:fs/promises';
import path from 'path';
import ImageKit from 'imagekit';
import type { FileObject } from 'imagekit/dist/libs/interfaces/FileDetails.js';
import { log } from './logger.js';
/* ========================================================================== */

export const cacheDir = '.astro-imagekit';
export const cacheIndex = 'media-index.json';
export const cacheImageInstancesDir = 'instances';
export const defaultBaseLocalDir = './content';

let ikInstance:
	| {
			imageKit: ImageKit;
			config: {
				urlEndpoint: string;
				baseLocalDir: string;
				remoteDir: string | undefined;
			};
			localIndex: FileObject[];
	  }
	| undefined;

const mediaIndexPath = path.join('', cacheDir, cacheIndex);

const localIndex = await fs
	.readFile(mediaIndexPath, 'utf-8')
	.catch((e) => {
		// throw e;
		log(() => `No image index found.`);
	})
	.then((r) => (r ? (JSON.parse(r) as unknown as FileObject[]) : []));

export function getImageKitInstance() {
	if (ikInstance) return ikInstance;

	const env =
		/* Vite runtime */
		import.meta.env || //
		/* Astro integration */
		process.env;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!env?.IMAGEKIT_URL_ENDPOINT)
		throw Error('IMAGEKIT_URL_ENDPOINT is missing!');
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!env?.IMAGEKIT_PUBLIC_KEY) throw Error('IMAGEKIT_PUBLIC_KEY is missing!');
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!env?.IMAGEKIT_PRIVATE_KEY)
		throw Error('IMAGEKIT_PRIVATE_KEY is missing!');

	let baseLocalDir = defaultBaseLocalDir;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const remoteDir = env?.IMAGEKIT_REMOTE_DIR;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!env?.IMAGEKIT_BASE_LOCAL_DIR) {
		// console.info(
		// 	`IMAGEKIT_BASE_LOCAL_DIR is missing, using \`${baseDir}\` as default.`,
		// );
	} else {
		baseLocalDir = path.join(process.cwd(), env.IMAGEKIT_BASE_LOCAL_DIR);
	}

	ikInstance = {
		imageKit: new ImageKit({
			publicKey: env.IMAGEKIT_PUBLIC_KEY,
			privateKey: env.IMAGEKIT_PRIVATE_KEY,
			urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
		}),
		config: {
			urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
			baseLocalDir,
			remoteDir,
		},
		localIndex,
	};

	log(() => env.IMAGEKIT_URL_ENDPOINT);

	return ikInstance;
}
