import { pascalCase } from 'change-case';
/* ·········································································· */
import type { JSONSchema } from 'json-schema-to-typescript';
import type {
  ServerState,
  Types,
  // Content,
} from '@astro-content/types/server-state';
import schemaToTypes from './schemas-to-types.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function generateTypes(
  content: ServerState['content'],
  schemas: ServerState['schemas'],
): Promise<Types> {
  if (!schemas || !content) return { common: '', browser: '', ide: '' };

  const contentSchemas = Object.entries(schemas.content);

  const iFaces = await schemaToTypes({
    // Asserting JSONSchema4 (`json-schema-to-typescript`)
    // as JSONSchema7 (`json-schema`)
    properties: schemas.content as JSONSchema,
  });

  let typesLiteral = '';

  contentSchemas.forEach(([key, schema]) => {
    if (schema.properties === undefined) return false;

    const entryNames =
      typeof content[key] === 'object' &&
      // FIXME: No overload match
      // @ts-ignore
      Object.entries(content[key])
        .map(([k]) => `'${k || 'none'}'`)
        .join(' | ');

    if (entryNames) {
      const name = pascalCase(schema.title ?? '');
      typesLiteral += `
type ${schema.title ?? ''}EntryNames = ${entryNames};
type ${pascalCase(key)} = {
  [key in ${name}EntryNames]?: ${name};
};`;
    }
    return null;
  });

  const iFacesEntities = `
export interface Entities {
${contentSchemas
  .map(([key, schema]) => {
    if (schema.properties === undefined) return false;

    return `  ${key}?: ${pascalCase(key)}`;
  })
  .join(';\n')};
}
`;

  const common = `
/* Interfaces */
${iFaces}
/* /Interfaces */


/* Entities */
${iFacesEntities}
/* /Entities */


/* Types */
${typesLiteral}

/* /Types */
`;

  const browser = `
${common}

async function get(files: unknown) {
  return files as Entities;
}
/**
* Global Astro utilities (stub)
* */
declare namespace Astro {
 const glob = (pattern: string) => {return []};
 export { glob };
}
`
    .replaceAll('export interface', 'interface')
    .replaceAll('export type', 'type');

  // TODO: Re-organize types object ——v
  return { common: '', browser, ide: common };
}

const importHelper = `// eslint-disable-next-line import/no-extraneous-dependencies
import { collect } from 'astro-content';
import type { FileInstance, Options } from 'astro-content';
import type { Entities } from '../.astro-content/types';

const get = collect as (
  pFiles: Promise<FileInstance[]>,
  options?: Options,
) => Promise<Entities>;

export { get };
export * from "../.astro-content/types";
`;

export { importHelper };
