import { pascalCase } from 'change-case';
import { compile, JSONSchema } from 'json-schema-to-typescript';
import { log } from './logger.js';
import { state } from './state.js';

/* —————————————————————————————————————————————————————————————————————————— */

export default async function schemaToTypes(schema: JSONSchema) {
  let entriesSchemas = 'type EmptySchema = Record<string, void>;\n\n';

  await Promise.all(
    Object.entries(schema.properties || {}).map(
      async ([entityKey, entityVal]) => {
        return Promise.all(
          Object.entries(entityVal.properties || {}).map(
            async ([propKey, propVal]) => {
              const name = `${pascalCase(entityKey)}${pascalCase(
                propKey,
              )}Schema`;
              if (Object.entries(propVal).length > 0) {
                await compile({ ...propVal }, name, {
                  bannerComment: '',
                  unknownAny: true,
                })
                  .then((ts) => {
                    const r = ts
                      .replace('export interface', 'interface')
                      .replace('export type', 'type');

                    entriesSchemas += `${r}\n`;
                  })
                  .catch((e) => {
                    log(e);
                  });
              } else {
                entriesSchemas += `type ${name} = EmptySchema;\n`;
              }
            },
          ),
        );
      },
    ),
  );

  let types = `/* Entries schemas */

${entriesSchemas}

/* /Entries schemas */

/* Entities */
`;
  Object.entries(schema.properties || {}).forEach(
    async ([entityKey, entityVal]) => {
      types += `interface ${pascalCase(
        state.schemas.content[entityKey].title ?? '',
      )} {\n`;

      Object.entries(entityVal.properties || {}).map(
        async ([propKey, propVal]) => {
          // FIXME:
          // @ts-expect-error
          const l = Object.entries(
            Object.entries(state.content[entityKey] || {})?.[0],
          )?.[1]?.[1]?.[propKey]?.language;

          types += `  ${propKey}: ${
            l === 'yaml' ? 'YamlInstance' : 'MarkdownInstance'
          }<`;
          types += `${pascalCase(entityKey)}${pascalCase(propKey)}Schema`;
          types += `>;\n`;
        },
      );
      types += `}\n\n`;
    },
  );
  types += `\n\n/* /Entities */`;

  return types;
}
