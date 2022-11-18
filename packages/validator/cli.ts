#! /usr/bin/env node

/* eslint-disable no-console */

import { generateAllCheckers } from './schema-to-validator.js';

console.log('Generating checkers…');

const outDir = process.argv[2];

console.log(`➤ Output directory: ${outDir ?? 'colocated'}`);

await generateAllCheckers(outDir);

export {};
