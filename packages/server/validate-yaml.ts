import yaml, { isNode, LineCounter } from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
/* ·········································································· */
import state from './state';
/* —————————————————————————————————————————————————————————————————————————— */

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export default function validateData(
  entity: string,
  entry: string,
  property: string,
  data: unknown,
  rawYaml?: string,
  schema?: unknown,
) {
  const schemaForAjv = {
    // definitions: { ...state.schemas.internals },
    ...(state.schemas?.content?.[entity]?.properties?.[property] || schema),
  };
  let validate;
  try {
    validate = ajv.compile(schemaForAjv);
  } catch (_) {
    return false;
  }
  if (validate) {
    if (state.errors[entity] === undefined) {
      state.errors[entity] = {};
    }
    if (state.errors[entity][entry] === undefined) {
      state.errors[entity] = { ...state.errors[entity], [entry]: {} };
    }
    if (state.errors[entity][entry][property] === undefined) {
      state.errors[entity] = {
        ...state.errors[entity],
        [entry]: {
          ...state.errors[entity][entry],
          [property]: { ...state.errors[entity][entry].lint, schema: [] },
        },
      };
    }

    if (rawYaml) {
      const lineCounter = new LineCounter();

      const yamlDoc = yaml.parseDocument(rawYaml, { lineCounter });
      const yamlJS = yamlDoc.toJS();

      validate(yamlJS);

      state.errors[entity][entry][property].schema = validate.errors?.map(
        (error) => {
          const ajvPath = error.instancePath.substring(1).split('/');
          const node = yamlDoc.getIn(ajvPath, true);

          if (isNode(node)) {
            const start = lineCounter.linePos(node.range[0]);
            const end = lineCounter.linePos(node.range[1]);

            const position = { start, end };

            return { ...error, position };
          }
          return error;
        },
      );
    }
    return state.errors[entity][entry][property];
  }
  return false;
}
