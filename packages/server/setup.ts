// NOTE: WORK IN PROGRESS

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import mkdirp from 'mkdirp';
import { spawn } from 'node:child_process';
import hjson from 'hjson';
import { add } from './add';
/* ·········································································· */
// import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

// TODO: Add `.gitignore` action
// TODO: Add `tsconfig.json` action

export async function setupRemark() {
  console.log('Setup remark');
}

export async function setupUnifiedVsCode() {
  /* VSCODE EXTENSIONS RECOMMENDATIONS */

  const vsCodeDir = path.join(process.cwd(), '.vscode');
  await mkdirp(vsCodeDir);

  const settings = await fs
    .readFile(path.join(vsCodeDir, 'extensions.json'), 'utf-8')
    .then((f) => hjson.parse(f))
    .catch((e) => console.log(e));

  console.log({ settings });
  console.log({ m: '' });

  settings.recommendations = settings?.recommendations || [];

  const extName = 'unifiedjs.vscode-remark';

  const isAlreadyReco = settings.recommendations.includes(extName);

  if (!isAlreadyReco) {
    settings.recommendations.push(extName);

    await fs.writeFile(
      path.join(vsCodeDir, 'extensions.json'),
      JSON.stringify(settings, null, 2),
    );
  } else {
    console.log('already reco');
  }

  console.log({ settings, isAlreadyReco });

  const ls2 = spawn('code', ['--install-extension', 'unifiedjs.vscode-remark']);
  ls2.stdout.on('data', (data) => {
    console.log(`stdout: ${data.toString()}`);
  });

  ls2.stderr.on('data', (data) => {
    console.log(`stderr: ${data.toString()}`);
  });

  ls2.on('exit', (code) => {
    console.log(`child process exited with code ${code.toString()}`);
  });
}

export function isValidContentBase() {
  return existsSync('./content') && existsSync('./content/default.schema.yaml');
}

export async function setupContentBase() {
  console.log('Setup content base');

  const contentDir = path.join(process.cwd(), 'content');
  await mkdirp(contentDir);

  const src = path.join(
    process.cwd(),
    'node_modules/astro-content/node_modules/@astro-content/server/schemas/default.schema.yaml',
  );

  const dest = path.join(contentDir, 'default.schema.yaml');

  console.log({ src, dest });

  await fs.cp(src, dest);

  // A bit brutal
  await add('articles', 'article');
  await add('articles', 'article');
  await add('articles', 'article');
  await add('articles', 'article');
  await add('people', 'person');
  await add('people', 'person');
}
