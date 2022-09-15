import jsf from 'json-schema-faker';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function generateFakeEntries(schema: JSONSchema7) {
  const fakeEntries = await jsf.resolve(schema).catch((e) => {
    log(e, 'absurd');
    return {};
  });

  log({ schema, fakeEntries }, 'absurd');

  return fakeEntries;
}
