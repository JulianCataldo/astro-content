import * as path from 'node:path';
import { sentenceCase } from 'change-case';
import fs from 'node:fs/promises';
import { camelCase } from 'lodash-es';
import prettier from 'prettier';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
/* ·········································································· */
import state from './state';
import validateData from './validate-yaml';
import validateMd from './validate-md';
/* —————————————————————————————————————————————————————————————————————————— */

interface File {
  file: string;
}
interface Markdown {
  frontmatter: Record<string, unknown>;
}
interface YAML {
  data: unknown;
}
type AnyFile = File & (Markdown | YAML);

/* ·········································································· */

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// FIXME: This prevents "duplicate key" error with AJV schema compiler
delete draft7MetaSchema.$id;

ajv.addMetaSchema(draft7MetaSchema);

/* ·········································································· */

function getTrio(relPath: string) {
  let [entity, entry, property] = relPath.split('/');
  entity = camelCase(entity);
  entry = camelCase(entry);
  if (property) {
    property = camelCase(path.basename(property, path.extname(property)));
  }
  return { entity, entry, property };
}

/* ·········································································· */

function handleSchema(filePath: string, file) {
  // FOR DEBUG ——v
  // state.schemas.content = {};

  const relPath = path.relative(
    'content',
    path.relative(process.cwd(), filePath),
  );
  const { entity, entry, property } = getTrio(relPath);

  const typeName = sentenceCase(
    path.basename(relPath).replace('.schema.yaml', ''),
  );
  state.schemas.content[entity] = {
    title: typeName,
    ...file.data,
  };
  state.schemas.raw[entity] = file.rawYaml;

  // /* Core meta schema validation */
  // let validate;
  // console.log({ coreSchema });
  // try {
  //   const schemaForAjv = {
  //     definitions: { ...state.schemas.internals, object: file.data },
  //   };

  //   validate = ajv.compile(schemaForAjv);
  // } catch (_) {
  //   return false;
  // }
  // if (validate) {
  //   validate(file.data);
  //   if (validate.errors) {
  //   }
  // }
}

/* ·········································································· */

async function handleContent(filePath: string, file) {
  const relPath = path.relative(
    'content',
    path.relative(process.cwd(), filePath),
  );
  // FOR DEBUG ——v
  // state.content = {};

  const { entity, entry, property } = getTrio(relPath);

  if (
    entity &&
    property &&
    state.schemas.content[entity]?.properties?.[property]
  ) {
    let data;

    if (state.content[entity] === undefined) {
      state.content[entity] = {};
    }
    if (state.content[entity][entry] === undefined) {
      state.content[entity][entry] = {};
    }

    if (filePath.endsWith('yaml') || filePath.endsWith('yml')) {
      data = { data: file.data, rawYaml: file.rawYaml };

      validateData(entity, entry, property, data.data, data.rawYaml);
    }
    if (filePath.endsWith('md')) {
      const rawMd = await fs.readFile(filePath, 'utf8');
      data = {
        ...file,
        file: undefined,
        headings: file.getHeadings(),
        rawMd,
        body: prettier.format(file.compiledContent(), { parser: 'html' }),
      };

      validateMd(
        rawMd,
        state.schemas.content[entity].properties[property].allOf[1]?.properties
          .frontmatter || {},
      )
        .then((errs) => {
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
                [property]: { schema: [], lint: [], prose: [] },
              },
            };
          }
          state.errors[entity][entry][property].lint = errs.lint;
          state.errors[entity][entry][property].schema = errs.schema;
          state.errors[entity][entry][property].prose = errs.prose;
        })
        .then(() => null)
        .catch(() => null);
    }
    if (filePath.endsWith('mdx')) {
      const rawMd = await fs.readFile(filePath, 'utf8');
      data = {
        ...file,
        file: undefined,
        headings: file.getHeadings(),
        rawMd,
      };
    }
    state.content[entity][entry][property] = data;
  }
}

/* ·········································································· */

const collect = async (pFiles: Promise<AnyFile[]>) => {
  const files = await pFiles.then((p) => p);

  console.log({ files });

  // /* HANDLE USER SCHEMAS — Defaults + entities */
  files.forEach((inputFile) => {
    const filePath = inputFile.file;
    if (filePath) {
      if (
        filePath.endsWith('.schema.yaml') &&
        !filePath.endsWith('default.schema.yaml')
      ) {
        handleSchema(filePath, inputFile);
      }
    }
  });

  // TODO: Reset state
  /* HANDLE CONTENT — YAML + MD + MDX */
  const promises = files.map(async (inputFile) => {
    const filePath = inputFile.file;

    if (filePath && !filePath.endsWith('.schema.yaml')) {
      await handleContent(filePath, inputFile);
    }
  });
  await Promise.all(promises);

  return state.content;
};

export default collect;
