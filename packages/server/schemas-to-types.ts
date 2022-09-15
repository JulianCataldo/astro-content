import { compile, JSONSchema } from 'json-schema-to-typescript';
import { log } from './logger.js';
/* ·········································································· */
import markdownFile from './schemas/MarkdownFile.js';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function schemaToTypes(schema: JSONSchema) {
  let type = '';

  const schemaForTs = {
    definitions: {
      MarkdownFile: markdownFile as JSONSchema,
    },
    title: 'Unused',
    ...schema,
  };

  await compile(schemaForTs, 'untitled', {
    bannerComment: '',
    unknownAny: true,
  })
    .then((ts) => {
      type = ts.replace('', '');
      // TODO: Remove top level generated interface
      // .replaceAll('\n', '——————')
      // .replaceAll(/————————————export interface Unused {(.*)}/g, '')
      // .replaceAll('——————', '\n');
    })
    .catch((e) => {
      log(e);
    });

  return type;
}
