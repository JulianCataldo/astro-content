/* eslint-disable max-lines */
import type { ServerState } from '@astro-content/types/server-state';
import { conf } from './config';

const state: ServerState = {
  content: {},

  schemas: {
    internals: {},
    content: {},
    raw: {},
  },

  errors: {},

  types: {
    entity: {},
    browser: '',
  },

  config: {
    previewUrl: conf.previewUrl,
  },
};
export default state;
