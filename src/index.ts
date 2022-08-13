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
import createEntity from './create-entity';
/* —————————————————————————————————————————————————————————————————————————— */

dotenv.config();
if (process.env.DIR) {
  process.chdir(process.env.DIR);
  $log(`Current dir: ${process.env.DIR}`);
} else {
  $log(`Current dir: ${process.cwd()}`);
}

let fakeMode = false;
let initModelMode: boolean;
let createEntityMode: string;
switch (process.argv[2]) {
  case 'fake':
    fakeMode = true;
    break;

  case 'init':
    createEntityMode = 'singleton';
    if (process.argv[4]) {
      createEntityMode = 'collection';
    }

    $log(
      `Initialize -${createEntityMode}- '${process.argv[3]}' ` +
        `with model '${process.argv[4]}'`,
    );
    break;

  // case 'create':
  //   createEntityMode = 'singleton';
  //   if (process.argv[4]) {
  //     createEntityMode = 'collection';
  //   }

  //   $log(
  //     `Creating collection ${process.argv[3]} with model ${process.argv[4]}`,
  //   );
  //   break;

  // default:
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

if (createEntityMode) {
  $log(
    `Creating collection "${process.argv[3]}" with model name "${process.argv[4]}"`,
  );
  await createEntity(process.argv[3], process.argv[4]);
  process.exit();
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
