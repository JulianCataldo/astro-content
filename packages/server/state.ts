/* eslint-disable max-lines */
import type { ServerState } from '@astro-content/types/server-state';
import { conf } from './config';

const ide = `import { collect } from 'astro-content';

export default collect as (files: unknown) => Promise<Entities>;`;

const state: ServerState = {
  content: {},

  schemas: {
    internals: {},
    content: {},
    raw: {},
  },

  errors: {},

  types: {
    common: '',
    ide,
    browser: '',
  },

  config: {
    previewUrl: conf.previewUrl,
  },
};
export default state;
