import fs from 'fs/promises';
import path from 'path';
import glob from 'glob-promise';

import { formats } from './Image.Props.js';
import { log } from './logger.js';
import { getImageKitInstance } from './imagekit-instance.js';
/* ========================================================================== */

function upload(file: Buffer, relPath: string) {
	log(({ k }) => `⏳ Uploading ${k.yellow(relPath)}`);

	const { imageKit } = getImageKitInstance();
	imageKit
		.upload({
			file,
			fileName: path.basename(relPath),
			folder: path.dirname(relPath),
			useUniqueFileName: false,
			extensions: [
				{
					name: 'google-auto-tagging',
					maxTags: 5,
					minConfidence: 95,
				},
			],
		})
		.then((r) => {
			log(
				({ k }) =>
					`✅ ${k.yellow(r.filePath)} was uploaded to:\n🔗 ${k.green(r.url)}`,
			);
		})
		.catch((error) => {
			console.error(error);
		});
}

/* —————————————————————————————————————————————————————————————————————————— */

export async function pushToRemote() {
	const { imageKit, config } = getImageKitInstance();

	const files = await glob(
		`${config.baseLocalDir}/**/*.{${formats.join(',')}}`,
	);
	const remoteIndex = await imageKit.listFiles({});

	files.forEach((filePath) => {
		let isPresentInRemote = false;
		const rel = `/${path.relative(
			path.join(process.cwd(), config.baseLocalDir),
			filePath,
		)}`;
		if (filePath.match(/ /)) {
			log(
				({ k }) =>
					`❌ Local ${k.red(`${rel}`)} ignored!\n` +
					`> You need to remove all white spaces.\n`,
			);
		} else {
			remoteIndex.forEach((remote) => {
				if (rel === remote.filePath) {
					isPresentInRemote = true;
				}
			});

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!isPresentInRemote) {
				fs.readFile(path.join(config.baseLocalDir, rel))
					.then((file) => {
						upload(file, rel);
					})
					.catch(() => null);
			}
		}
	});
}
