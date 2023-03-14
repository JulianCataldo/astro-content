#! /usr/bin/env node

import { program } from '@commander-js/extra-typings';
import dotenv from 'dotenv';
import { log } from './logger.js';
import { pushToRemote } from './file-handlers.js';
import { pullMediaIndex } from './sync-media-index.js';
/* ========================================================================== */

log(() => `Astro ImageKit — Command Line Interface`);

/* TODO: Make it configurable */
function loadEnv(envFile = './.env') {
	dotenv.config({ path: envFile });
}

/* —————————————————————————————————————————————————————————————————————————— */

program
	.name('imagekit')
	.command('index')
	.description('Manage library index.')
	.option(
		'-e, --env-file <path>',
		'Choose which env. file to use. Useful if sourcing from parent (mono-repo.).',
	)
	.option('-r, --pull', 'Pull remote index to local cache folder.')
	.option('-v, --verbose', 'Dump all outputs.')

	.action((options, _command) => {
		loadEnv(options.envFile);

		if (options.pull) {
			/* NOTE: This is a bit cumbersome */
			(async () =>
				pullMediaIndex({ verbose: options.verbose }).catch((e) => {
					throw e;
				}))().catch((e) => {
				throw e;
			});
		}
	});

program
	.command('medias')
	.description('Manage library medias.')
	.option(
		'-s, --push',
		'Push local files to ImageKit configured distributable directory.',
	)
	.option(
		'-e, --env-file <path>',
		'Choose which env. file to use.\nUseful if sourcing from parent (mono-repo.).',
	)
	.action((options, _command) => {
		loadEnv(options.envFile);

		if (options.push) {
			(async () =>
				pushToRemote().catch((e) => {
					throw e;
				}))().catch((e) => {
				throw e;
			});
		}
	});

program.parse();
