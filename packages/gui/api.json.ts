import type { APIRoute } from 'astro';
// import fs from 'node:fs/promises';
// import path from 'node:path';
/* ·········································································· */
import state from '@astro-content/server/state';
/* —————————————————————————————————————————————————————————————————————————— */

/* ·········································································· */

export function getStaticPaths() {
  return [
    { params: { endpoint: 'schemas' } },
    { params: { endpoint: 'types' } },
    { params: { endpoint: 'config' } },
    { params: { endpoint: 'content' } },
    { params: { endpoint: 'errors' } },
    // { params: { endpoint: '__save' } },
  ];
}

export const get: APIRoute = ({ params, request }) => {
  // console.log(params, request.method);

  if (typeof params.endpoint === 'string' && request.method === 'GET') {
    return {
      body: JSON.stringify(state[params.endpoint]),
    };
  }
  // if (request.method === 'PUT') {
  //   console.log('PUT');
  //   return {
  //     body: '{ "success": true }',
  //   };
  // }
  return {
    body: '{}',
  };
};
