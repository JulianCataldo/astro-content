// NOTE: WORK IN PROGRESS

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import mkdirp from 'mkdirp';
// /* ·········································································· */
// import { spawn } from 'node:child_process';
// import hjson from 'hjson';
import { add } from './add.js';
import { log } from './logger.js';
// import { contentDir } from './state.js';
// /* —————————————————————————————————————————————————————————————————————————— */

const contentDir = path.join(process.cwd(), 'content');

// TODO: Add `.gitignore` action
// TODO: Add `tsconfig.json` action

export async function remarkLint() {
  //   console.log('Setup remark');
}

export async function unifiedVsCode() {
  //   /* VSCODE EXTENSIONS RECOMMENDATIONS */
  //   const vsCodeDir = path.join(process.cwd(), '.vscode');
  //   await mkdirp(vsCodeDir);
  //   const settings = await fs
  //     .readFile(path.join(vsCodeDir, 'extensions.json'), 'utf-8')
  //     .then((f) => hjson.parse(f))
  //     .catch((e) => console.log(e));
  //   console.log({ settings });
  //   console.log({ m: '' });
  //   settings.recommendations = settings?.recommendations || [];
  //   const extName = 'unifiedjs.vscode-remark';
  //   const isAlreadyReco = settings.recommendations.includes(extName);
  //   if (!isAlreadyReco) {
  //     settings.recommendations.push(extName);
  //     await fs.writeFile(
  //       path.join(vsCodeDir, 'extensions.json'),
  //       JSON.stringify(settings, null, 2),
  //     );
  //   } else {
  //     console.log('Already reco.');
  //   }
  //   console.log({ settings, isAlreadyReco });
  //   const ls2 = spawn('code', ['--install-extension', 'unifiedjs.vscode-remark']);
  //   ls2.stdout.on('data', (data) => {
  //     console.log(`stdout: ${data.toString()}`);
  //   });
  //   ls2.stderr.on('data', (data) => {
  //     console.log(`stderr: ${data.toString()}`);
  //   });
  //   ls2.on('exit', (code) => {
  //     console.log(`child process exited with code ${code.toString()}`);
  //   });
}

export function isValidContentBase() {
  return existsSync('./content') && existsSync('./content/default.schema.yaml');
}

export async function contentBase() {
  log('Setting up content base', 'info', 'pretty');

  await mkdirp(contentDir);

  // REFACTOR: Nicer file resolution
  const src = path.join(
    process.cwd(),
    'node_modules/astro-content/node_modules/@astro-content/server/schemas/default.schema.yaml',
  );
  const dest = path.join(contentDir, 'default.schema.yaml');
  log({ src, dest });
  await fs.cp(src, dest);

  // REFACTOR: A bit brutal
  await add('articles', 'article');
  await add('articles', 'article');
  await add('articles', 'article');
  await add('articles', 'article');
  await add('people', 'person');
  await add('people', 'person');
}
