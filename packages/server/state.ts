/* eslint-disable max-lines */
/* ·········································································· */
import type { JSONSchema7 } from 'json-schema';
import type { Endpoint, ServerState } from '@astro-content/types/server-state';
import markdownFile from './schemas/MarkdownFile.json' assert { type: 'json' };
/* —————————————————————————————————————————————————————————————————————————— */

const apiBase = '/__content/api';

const emptyState: ServerState = {
  content: {},

  schemas: {
    content: {},
    raw: {},
    internals: {
      MarkdownFile: markdownFile as JSONSchema7,
    },
  },

  reports: {},

  types: {
    common: '',
    ide: '',
    browser: '',
  },

  config: {
    previewUrl: '/',
    // TODO: auto-detection + injection for GUI command hints for example
    // packageManager: 'pnpm',
  },
};

const getEmptyState = () =>
  JSON.parse(JSON.stringify(emptyState)) as ServerState;

const state = getEmptyState();

const data: Endpoint[] = [
  'schemas',
  'types',
  'config',
  'content',
  'reports',
  //
];

const actions = {
  save: { endpoint: `${apiBase}/~save` },
  fake: { endpoint: `${apiBase}/~fake` },
  validate: { endpoint: `${apiBase}/~validate` },
};

export { state, data as endpoints, actions, getEmptyState, apiBase };
