import Ajv from 'ajv';
import _ from 'lodash-es';

const ajv = new Ajv();

async function getData(path?: string) {
  const result = await fetch(`http://0.0.0.0:5010/${path}`)
    .then((response) => response.json())
    .catch(() => null)
    .then((data) => data);
  return result;
}
async function validateData(url: string, data: unknown) {
  const schemas = await getData('schemas');
  const schema = schemas?.content[url];

  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (e) {
    return false;
  }
  if (validate) {
    const result = validate(data);
    if (validate.errors) {
      // console.log(validate.errors);
      return false;
    }
    return result;
  }
  return false;
}

export default async function getContent(path: string) {
  const result = await getData('v1');

  const validData = {};
  await Promise.all(
    Object.entries(result[path].items).map(async ([key, val]) => {
      const isValid = (await validateData(path, val)) === true;
      if (isValid) {
        (validData as { [key: string]: unknown })[key] = val;
      }
    }),
  );
  return validData;
}
