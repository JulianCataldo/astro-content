#! /usr/bin/env node --no-warnings

/* ——————————————————————————————————————————————————————————————————————————— *
 *              © Julian Cataldo — https://www.juliancataldo.com.              *
 *                      See LICENSE in the project root.                       *
/* —————————————————————————————————————————————————————————————————————————— */

import pkg from './package.json' assert { type: 'json' };
/* ·········································································· */
// NOTE: Force embedding in dist. with Parcel
import './node_modules/@astro-content/server/add';
/* —————————————————————————————————————————————————————————————————————————— */

console.log(`Maestro — CLI — ${pkg.version}`);

// pnpm content add zebras zebra
