import type { Part } from '@astro-content/types/gui-state';
// import yaml from 'yaml';
import yaml, { isNode, LineCounter } from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { state } from './state';
import { log } from './logger';
/* —————————————————————————————————————————————————————————————————————————— */

const ajv = new Ajv({
  allErrors: false,
  strict: false,
  logger: false,
  strictSchema: false,
  strictNumbers: false,
  strictTypes: false,
  strictTuples: false,
  strictRequired: false,
});
addFormats(ajv);

export function validateYaml(
  entity: Part,
  entry: Part,
  property: Part,
  rawYaml: string,
) {
  log({ rawYaml }, 'absurd', 'table');

  if (!entity || !entry || !property) {
    return false;
  }

  let schemaForAjv: JSONSchema7 | null = null;

  // FIXME: ——————————————————————————————————————v
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const yamlSchema = state.schemas.content[entity]?.properties?.[property];
  log(yamlSchema, 'absurd');

  if (typeof yamlSchema === 'object') {
    schemaForAjv = {
      definitions: { ...state.schemas.internals },
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
    log(validate.errors, 'absurd');

    if (state.errors[entity] === undefined) {
      state.errors[entity] = {};
    }
    if (state.errors[entity]?.[entry] === undefined) {
      state.errors[entity] = { ...state.errors[entity], [entry]: {} };
    }
    if (state.errors[entity]?.[entry]?.[property] === undefined) {
      state.errors[entity] = {
        ...state.errors[entity],
        [entry]: {
          ...state.errors[entity]?.[entry],
          [property]: { ...state.errors[entity]?.[entry]?.lint, schema: [] },
        },
      };
    }

    if (rawYaml) {
      const lineCounter = new LineCounter();

      const yamlDoc = yaml.parseDocument(rawYaml, { lineCounter });
      const yamlJS = yamlDoc.toJS() as unknown;

      validate(yamlJS);

      if (Array.isArray(state.errors[entity]?.[entry]?.[property]?.schema))
        // FIXME: (possibly undefined)
        state.errors[entity][entry][property].schema = validate.errors?.map(
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

    return state.errors[entity]?.[entry]?.[property];
  }
  return false;
}
