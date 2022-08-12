import dotenv from 'dotenv';
/* ·········································································· */
import { loadConfig } from './config';
import loadSchemas from './load-schemas';
import loadFiles from './load-files';
import loadFakeData from './load-fake-data';
import generateHelper from './generate-client-helper';
import updateVsCode from './update-vscode';
import serve from './serve';
/* ·········································································· */
import type { CcConfig } from '../types/config';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

dotenv.config();
if (process.env.DIR) {
  process.chdir(process.env.DIR);
  $log(`Current dir: ${process.env.DIR}`);
} else {
  $log(`Current dir: ${process.cwd()}`);
}

let fakeMode = false;
switch (process.argv[2]) {
  case 'fake':
    fakeMode = true;
    break;
  default:
}

await loadConfig();

await loadSchemas();

if (fakeMode) {
  $log('Loading fake data…');
  setTimeout(async () => {
    await loadFakeData();
  }, 200);
} else {
  setTimeout(async () => {
    await loadFiles();
  }, 200);
}

// FIXME: avoid timeouts if possible
setTimeout(async () => {
  await generateHelper();
}, 500);

setTimeout(async () => {
  await updateVsCode();
}, 500);

setTimeout(async () => {
  serve();
}, 1000);

export type Config = Partial<CcConfig>;
