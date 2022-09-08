/* eslint-disable max-lines */
/* ·········································································· */
import type { ServerState } from '@astro-content/types/server-state';
import markdownFile from './schemas/MarkdownFile.json' assert { type: 'json' };
/* —————————————————————————————————————————————————————————————————————————— */

const emptyState = {
  content: {},

  schemas: {
    content: {},
    raw: {},
    internals: {
      MarkdownFile: markdownFile,
    },
  },

  errors: {},

  types: {
    common: '',
    ide: '',
    browser: '',
  },

  config: {
    previewUrl: '/',
    // TODO: auto-detection + injection for GUI command hints for example
    packageManager: 'pnpm',
  },
};

const getEmptyState = () =>
  JSON.parse(JSON.stringify(emptyState)) as ServerState;

const state = getEmptyState();

const endpoints = [
  'schemas',
  'types',
  'config',
  'content',
  'errors',
  //
];

export { state, endpoints, getEmptyState };
