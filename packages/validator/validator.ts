import Ajv, { AsyncSchema } from 'ajv';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import addFormats from 'ajv-formats';
import path from 'node:path';
import jsf from 'json-schema-faker';
import { set, get, cloneDeep } from 'lodash-es';
import type { JSONSchema7 } from 'json-schema';
/* ========================================================================== */

const ajv = new Ajv({
  allErrors: true /* So it doesn't stop at the first found error */,
  strict: false /* Prevents warnings for valid, but relaxed schemas */,
});
addFormats(ajv);

export type GenericFrontmatter = Record<string, unknown>;

export async function itemChecker<T>(item: unknown, schemaPath: string) {
  const schema = await $RefParser
    .bundle(path.join(process.cwd(), schemaPath))
    .then((refSchema) => refSchema as AsyncSchema)
    .catch(() => ({} as AsyncSchema));

  const validate = ajv.compile(schema);

  let clone: GenericFrontmatter = {};

  if (
    item &&
    Object.entries(item).every(([key, val]) => typeof key === 'string' && val)
  ) {
    // TODO: Remove assertion
    clone = cloneDeep(item as GenericFrontmatter);
    // NOTE: Remove Astro
    // {
    //   ...item,
    //   $schema: undefined,
    //   file: undefined,
    //   url: undefined,
    //   astro: undefined,
    // };
    /* Remove local schema (E.g. for RLFMS) */
    if (clone.$schema) {
      delete clone.$schema;
    }

    await validate(clone);

    if (validate.errors) {
      /* Generate dummy data which will replace missing or wrong values */
      // TODO: Opting out of this behavior, with for all or nothing validation.

      jsf.option({ useDefaultValue: true, useExamplesValue: true });
      const dummies = jsf.generate(schema);

      validate.errors.forEach((e) => {
        let dotPath = '';
        if (
          e.keyword === 'required' &&
          typeof e.params.missingProperty === 'string'
        ) {
          dotPath = e.params.missingProperty;
        } else {
          dotPath = e.instancePath.substring(1).replaceAll('/', '.');
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const dummy = get(dummies, dotPath) as unknown;
        set(clone, dotPath, dummy);
      });
    }
  } else {
    console.warn('Could not validate frontmatter section.');
  }

  return {
    result: clone as T,
    errors: validate.errors ? validate.errors : undefined,
    original: validate.errors ? item : undefined,
    schema: schema as JSONSchema7,
  };
}
