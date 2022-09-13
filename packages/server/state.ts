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

const contentBase = '/__content';
const apiBase = `${contentBase}/api`;
const endpoints = {
  data,
  contentBase,
  apiBase,
  actions: {
    save: `${apiBase}/~save`,
    fake: `${apiBase}/~fake`,
    validate: `${apiBase}/~validate`,
    refresh: `${apiBase}/~refresh`,
  },
};

export {
  //
  state,
  endpoints,
  getEmptyState,
};
