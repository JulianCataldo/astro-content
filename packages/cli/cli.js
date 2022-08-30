#! /usr/bin/env node --no-warnings

/* ——————————————————————————————————————————————————————————————————————————— *
 *              © Julian Cataldo — https://www.juliancataldo.com.              *
 *                      See LICENSE in the project root.                       *
/* —————————————————————————————————————————————————————————————————————————— */

import pkg from './package.json' assert { type: 'json' };
console.log(`Maestro — CLI — ${pkg.version}`);

/* —————————————————————————————————————————————————————————————————————————— */

import './lib/cli/index.js';
