import type { Part } from '@astro-content/types/gui-state';
// import yaml from 'yaml';
import yaml, { isNode, LineCounter } from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { state } from './state.js';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  logger: false,
  strictSchema: false,
  strictNumbers: false,
  strictTypes: false,
  strictTuples: false,
  strictRequired: false,
});
addFormats(ajv);

export function handleYaml(
  entity: Part,
  entry: Part,
  property: Part,
  raw: string,
  schema?: JSONSchema7,
) {
  log({ raw }, 'absurd', 'table');

  if (!entity || !entry || !property) {
    return false;
  }

  let schemaForAjv: JSONSchema7 | null = null;

  // FIXME: No unnecessary
  const yamlSchema =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    state.schemas.content[entity]?.properties?.[property] || schema;
  log(yamlSchema, 'absurd');

  if (typeof yamlSchema === 'object') {
    schemaForAjv = {
      // definitions: { ...state.schemas.internals },
      ...yamlSchema,
    };
  }

  if (schemaForAjv) {
    let validate;
    try {
      validate = ajv.compile(schemaForAjv);
    } catch (e) {
      validate = false;
      log(e);
      return false;
    }
    log({ value: validate.errors, level: 'absurd' });

    if (state.reports[entity] === undefined) {
      state.reports[entity] = {};
    }
    if (state.reports[entity]?.[entry] === undefined) {
      state.reports[entity] = { ...state.reports[entity], [entry]: {} };
    }
    if (state.reports[entity]?.[entry]?.[property] === undefined) {
      state.reports[entity] = {
        ...state.reports[entity],
        [entry]: {
          ...state.reports[entity]?.[entry],
          [property]: { ...state.reports[entity]?.[entry]?.lint, schema: [] },
        },
      };
    }

    if (raw) {
      const lineCounter = new LineCounter();

      const yamlDoc = yaml.parseDocument(raw, { lineCounter });
      const yamlJS = yamlDoc.toJS() as unknown;

      validate(yamlJS);

      if (Array.isArray(state.reports[entity]?.[entry]?.[property]?.schema))
        // FIXME: (possibly undefined)
        // @ts-ignore
        state.reports[entity][entry][property].schema = validate.errors?.map(
          (error) => {
            const ajvPath = error.instancePath.substring(1).split('/');
            const node = yamlDoc.getIn(ajvPath, true);

            if (isNode(node) && node.range) {
              const s = lineCounter.linePos(node.range[0]);
              const e = lineCounter.linePos(node.range[1]);
              const start = { line: s.line, column: s.col };
              const end = { line: e.line, column: e.col };

              return { ...error, position: { start, end } };
            }
            return error;
          },
        );
    }

    return state.reports[entity]?.[entry]?.[property];
  }
  return false;
}
