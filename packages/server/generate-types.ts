import { pascalCase } from 'change-case';
import prettier from 'prettier';

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
export type ${pascalCase(schema.title ?? '')}EntryNames = ${entryNames};
export type ${pascalCase(key)} = {
  [key in ${name}EntryNames]?: ${name};
};\n`;
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

  const ide = `import type { MarkdownInstance } from "astro";
import type { YamlInstance } from 'astro-content';
`;

  const common = `
/* — Interfaces — */
${iFaces}
/* — /Interfaces — */

/* Types */
${typesLiteral}
/* /Types */

/* Entities */
${iFacesEntities}
/* /Entities */
`;

  const browser = `
/* Stubs */

type AstroComponentFactory = {};
type MarkdownHeading = {
  depth: number;
  slug: string;
  text: string;
};
interface MarkdownInstance<T extends Record<string, any>> {
  frontmatter: T;
  file: string;
  url: string | undefined;
  Content: AstroComponentFactory;
  rawContent(): string;
  compiledContent(): string;
  getHeadings(): MarkdownHeading[];
  getHeaders(): void;
  default: any;
}

interface YamlInstance<T> {
  data: T;
  file: string;
  raw: string;
}

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

/* /Stubs */
`
    .replaceAll('export interface', 'interface')
    .replaceAll('export type', 'type');

  const commonFormatted = prettier.format(common, {
    parser: 'typescript',
    printWidth: 80,
  });

  // TODO: Re-organize types object ——v
  return {
    common: commonFormatted,
    browser,
    ide,
  };
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
