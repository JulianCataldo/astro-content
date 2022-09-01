import { pascalCase } from 'change-case';
/* ·········································································· */
import type {
  Content,
  Types,
  Schemas,
} from '@astro-content/types/server-state';
/* —————————————————————————————————————————————————————————————————————————— */

export default function generateBrowserTypes(
  content: Content,
  schemas: Schemas,
  types: Types,
) {
  const contentSchemas = Object.entries(schemas.content);

  const typesArr = Object.entries(types.entity);

  const iFaces = typesArr.map(([, val]) => {
    const c = val?.replaceAll('export interface', 'interface');
    return c;
  });

  let typesLiteral = '';

  contentSchemas?.forEach(([key, schema]) => {
    if (schema.properties === undefined) return false;

    const entryNames =
      typeof content[key] === 'object' &&
      Object.entries(content[key])
        .map(([k]) => `'${k || 'none'}'`)
        .join(' | ');

    if (entryNames) {
      typesLiteral += `
      type ${schema.title ?? ''}EntryNames = ${entryNames};
      type ${pascalCase(key)} = {
        [key in ${pascalCase(schema.title ?? '')}EntryNames]?: ${pascalCase(
        schema.title ?? '',
      )};
      };
      `;
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

  const entitiesNames = `
declare const entitiesNames: ${contentSchemas
    .map(([key, schema]) => {
      if (schema.properties === undefined) return false;

      return `'${key}'`;
    })
    .join(' | ')};
`;

  const result = `

/* Interfaces */
${iFaces.join(' ')}
/* /Interfaces */

/* Types */
${typesLiteral}
/* /Types */


/* interfaces Entities */
${iFacesEntities}
/* /Types */

${entitiesNames}

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

  return result;
}
