import fs from 'node:fs/promises';
// import { existsSync } from 'node:fs';
import type { FileObject } from 'imagekit/dist/libs/interfaces/FileDetails.js';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Props } from './Image.Props.js';
import { getBase64DataURI } from './base64.js';
import {
	getImageKitInstance,
	cacheDir,
	cacheImageInstancesDir,
} from './imagekit-instance.js';

export default async function loadImageInstance(props: Props) {
	console.log('object');

	const md5 = crypto
		.createHash('md5')
		.update(JSON.stringify(props))
		.digest('hex');

	const destDir = path.join(cacheDir, cacheImageInstancesDir);
	const instanceFilePath = path.join(destDir, `${md5}.json`);

	// if (existsSync(instanceFilePath)) {
	// 	const f = await fs.readFile(instanceFilePath, 'utf-8');
	// 	return JSON.parse(f) as unknown;
	// }

	/* — */

	const { imageKit, localIndex, config } = getImageKitInstance();

	let file: FileObject | undefined;
	localIndex.forEach((f) => {
		const p = path.join(config.remoteDir ?? '', props.path);
		const p2 = f.filePath;
		if (p === p2) {
			file = f;
		}
	});

	if (file?.fileType !== 'image') throw Error('Not an image!');

	const maxWidth = file.width;
	const ratio = file.height / file.width;

	/* —————————————————————————————————————————————————————————————————————————— */

	const urlOptions = props.urlOptions ?? { path: props.path };

	// return;
	const urlForB64 = imageKit.url({
		...urlOptions,
		transformation: [{ width: 32, height: 32 * ratio }],
	});

	const b64Placeholder = await getBase64DataURI(urlForB64);

	const sourceSetArr: string[] = [];
	props.widths.forEach((w) => {
		if (w > maxWidth) return;

		const url = imageKit.url({
			...urlOptions,

			transformation: [
				...(urlOptions.transformation ?? []),
				{ width: w, height: w * ratio },
			],
		});
		sourceSetArr.push(`${url} ${w}w`);
	});
	const sourceSet = sourceSetArr.join(', ');

	await fs.mkdir(destDir, {
		recursive: true,
	});

	const instance = {
		ratio,
		sourceSet,
		b64Placeholder,
		...props,
	};

	await fs.writeFile(instanceFilePath, JSON.stringify(instance, null, 2));

	return instance;
}
