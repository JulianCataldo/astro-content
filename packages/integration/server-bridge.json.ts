import type { APIRoute } from 'astro';
/* ·········································································· */
import type { Endpoint } from '@astro-content/types/server-state';
import { state, endpoints } from '@astro-content/server/state';
import { log } from '@astro-content/server/logger';
/* —————————————————————————————————————————————————————————————————————————— */

export function getStaticPaths() {
  return endpoints.data.map((endpoint) => ({ params: { endpoint } }));
}

export const get: APIRoute = ({ params, request }) => {
  // NOTE: Only "GET" seems to work?
  log({ params, method: request.method }, 'absurd');

  const endpoint = params.endpoint as Endpoint;

  if (
    request.method === 'GET' &&
    typeof params.endpoint === 'string' &&
    endpoints.data.includes(endpoint)
  ) {
    log({ params, method: request.method });
    return {
      body: JSON.stringify(state[endpoint]),
    };
  }

  /* No endpoint found, send empty response body */
  return {
    body: '{}',
  };
};
