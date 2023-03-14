import fs from 'node:fs/promises';
import path from 'node:path';
import {
	getImageKitInstance,
	cacheDir,
	cacheIndex,
} from './imagekit-instance.js';
import { dump } from './logger.js';
/* ========================================================================== */

export async function pullMediaIndex({ verbose = false }) {
	const mediaIndexPath = path.join(cacheDir, cacheIndex);

	const { imageKit } = getImageKitInstance();

	/* TODO: Should filter base local dir */
	const remoteIndex = await imageKit.listFiles({});

	if (verbose) dump(remoteIndex);

	await fs.mkdir(path.dirname(mediaIndexPath), { recursive: true });

	await fs.writeFile(mediaIndexPath, JSON.stringify(remoteIndex, null, 2));
}
