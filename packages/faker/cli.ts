#! /usr/bin/env node

/* eslint-disable no-console */

import { generateFakeContent } from './index.js';

console.log('Generating checkers…');

const mdTemplatePath = process.argv[2];
const outDir = process.argv[3];
const count = parseInt(process.argv[4] ?? '1', 10);

/* ·········································································· */

console.log(
  `➤ Generating fake entries: ${mdTemplatePath}, ${outDir}, ${count}`,
);

if (Boolean(mdTemplatePath) === false) {
  console.log(`Missing input template path`);
  process.exit();
}
if (Boolean(outDir) === false) {
  console.log(`Missing output directory`);
  process.exit();
}

await generateFakeContent(mdTemplatePath, outDir, count).catch((error) => {
  console.log(error);
});

export {};
