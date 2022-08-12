import * as fs from 'node:fs/promises';
import { kebabCase } from 'lodash-es';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import mkdirp from 'mkdirp';
/* ·········································································· */
import state from './state';
import { conf } from './config';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export default async function validateData(
  parent: string,
  entryName: string,
  name: string,
  data: unknown,
) {
  const schemaForAjv = {
    // definitions: { ...state.schemas.internals },
    ...state.schemas?.content[parent].properties[name],
  };

  let validate;
  try {
    validate = ajv.compile(schemaForAjv);
  } catch (_) {
    return false;
  }
  if (validate) {
    const result = validate(data);
    const entryPath = path.join(kebabCase(parent), kebabCase(entryName));
    const dir = path.join(process.cwd(), conf.errors.dest, entryPath);
    const fileDest = path.join(dir, `${name}.log.yaml`);
    if (validate?.errors?.length) {
      $log(validate.errors);

      await mkdirp(dir);

      // const sourceFilePath = path.join(
      //   process.cwd(),
      //   conf.components.src,
      //   entryPath,
      //   `${name}.yaml`,
      // );
      // const header = `# Source file://${sourceFilePath}\n\n`;
      const header = ``;
      const yamlContent = `${header}${yaml.dump(validate.errors)}`;

      let previous;
      if (state.errors[parent]) {
        if (state.errors[parent][entryName]) {
          // previous = state.errors[parent][entryName];
        }
      }

      fs.writeFile(fileDest, yamlContent);
      state.errors[parent] = {
        [entryName]: { schema: validate.errors },
      };
      return false;
    }

    // TODO: remove empty folders too
    fs.rm(fileDest)
      .then(() => {
        fs.readdir(dir)
          .then((files) => {
            if (!files.length) {
              fs.rmdir(dir).catch(() => null);
            }
          })
          .catch(() => null);
      })
      .catch(() => null);

    return result;
  }
  return false;
}
