// import Ajv from 'ajv';
/* ·········································································· */
// import conf from '../config';
/* —————————————————————————————————————————————————————————————————————————— */

async function getData(fullUrl) {
  const result = await fetch(fullUrl)
    .then((response) => response.json())
    .catch((_) => null)
    .then((data) => data);

  return result;
}

export default async function getContent(url: string, path?: string) {
  const fullUrl = `${url}/${path}`;
  const result = await getData(fullUrl);

  if (result) {
    return result;
  }
  return false;
}
