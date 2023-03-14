import type { AstroIntegration } from 'astro';
// import kleur from 'kleur';
import { log } from './logger.js';
import { pushToRemote } from './file-handlers.js';
import { formats } from './Image.Props.js';
import { defaultBaseLocalDir } from './imagekit-instance.js';

/* ========================================================================== */

// interface Settings {}

/* —————————————————————————————————————————————————————————————————————————— */

/* NOTE: For same-file bursted triggers with Astro Vite dev. server watcher */
// From https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940
function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
	func: F,
	waitFor: number,
): (...args: Parameters<F>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<F>): void => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), waitFor);
	};
}
const pushDebounced = debounce(() => {
	log(({ k }) => `${k.yellow('An image change was detected. Handling…\n')}`);
	pushToRemote().catch(() => undefined);
}, 1);

/* —————————————————————————————————————————————————————————————————————————— */

export const integration = (/* settings: Settings */): AstroIntegration => ({
	name: 'imagekit',
	hooks: {
		'astro:config:setup': async ({ command }) => {
			/* NOTE: Env. var sourcing here is just for immediate display purpose.
				Envs. are being check inside the handler right after */
			const baseDir =
				process.env.IMAGEKIT_BASE_LOCAL_DIR ?? defaultBaseLocalDir;

			log(({ k }) =>
				k.yellow(`${k.bold(baseDir)} > ImageKit integration loaded.\n`),
			);

			/* This is a local only process */
			if (command === 'dev') {
				await pushToRemote();
			}
		},

		'astro:server:setup': ({ server }) => {
			server.watcher.on('all', (_event, filePath) => {
				if (formats.some((f) => filePath.endsWith(f))) {
					pushDebounced();
				}
			});
		},
	},
});
