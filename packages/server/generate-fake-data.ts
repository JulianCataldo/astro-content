import jsf from 'json-schema-faker';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function generateFakeEntries(schema: JSONSchema7) {
  // NOTE: This is a fix for `process.browser` bug, `location.href` not found.
  globalThis.location = { ...globalThis.location, href: process.cwd() };

  const fakeEntries = await jsf.resolve(schema).catch((e) => {
    log(e, 'absurd');
    return {};
  });

  log({ schema, fakeEntries }, 'absurd');

  return fakeEntries;
}
