import type { APIRoute } from 'astro';
import state from '@astro-content/server/state';

export function getStaticPaths() {
  return [
    { params: { endpoint: 'schemas' } },
    { params: { endpoint: 'types' } },
    { params: { endpoint: 'config' } },
    { params: { endpoint: 'content' } },
    { params: { endpoint: 'errors' } },
  ];
}

export const get: APIRoute = ({ params, request }) => {
  // console.log(params, request);

  if (typeof params.endpoint === 'string') {
    return {
      body: JSON.stringify(state[params.endpoint]),
    };
  }
  return {
    body: '_',
  };
};
