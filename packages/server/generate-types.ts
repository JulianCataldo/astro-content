import { pascalCase } from 'change-case';
/* ·········································································· */
import type {
  Content,
  Schemas,
  ServerState,
  Types,
} from '@astro-content/types/server-state';
import schemaToTypes from './schemas-to-types';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function generateBrowserTypes(
  content: ServerState['config'],
  schemas: ServerState['schemas'],
  ide: ServerState['types']['ide'],
): Promise<Types | false> {
  if (!schemas || !content) return false;

  const contentSchemas = Object.entries(schemas.content);

  const types = await schemaToTypes({
    title: 'Unused',
    properties: schemas.content,
  });

  const iFaces = types
    .replaceAll('export interface', 'interface')
    .replaceAll('export type', 'type');

  let typesLiteral = '';

  contentSchemas.forEach(([key, schema]) => {
    if (schema.properties === undefined) return false;

    const entryNames =
      typeof content[key] === 'object' &&
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
interface Entities {
${contentSchemas
  .map(([key, schema]) => {
    if (schema.properties === undefined) return false;

    return `  ${key}?: ${pascalCase(key)}`;
  })
  .join(';\n')};
}
`;

  const browser = `
async function get(files: unknown) {
  return files as Entities;
}
/**
* Global Astro utilities
* */
declare namespace Astro {
 const glob = (pattern: string) => {return []};
 export { glob };
}
declare module 'astro-content' {
 export { get };
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

  return { common, browser, ide };
}

//   const entitiesNames = `
// declare const entitiesNames: ${contentSchemas
//     .map(([key, schema]) => {
//       if (schema.properties === undefined) return false;

//       return `'${key}'`;
//     })
//     .join(' | ')};
// `;
/* interfaces Entities */
// $ {iFacesEntities}
/* /Types */

// $ {entitiesNames}
// console.log({ types, s: schemas.content });
// const typesArr = await Promise.all(
//   contentSchemas.map(async ([entity]) => {
//     console.log({ type });
//     return type;
//   }),
// );

// state.types.entity[entity] = type;
// const typesArr = Object.entries(types.entity);

// const iFaces = typesArr.map(([, val]) => {
//   const c = val?.replaceAll('export interface', 'interface');
//   return c;
// });
