/* eslint-disable max-lines */
import type { Content, Schemas, Errors } from './types/state';
import { conf } from './config';

const state = {
  content: {} as Content,

  schemas: {
    internals: {},
    content: {},
    raw: {},
  } as Schemas,

  errors: {} as Errors,

  types: 'NONE',

  config: {
    previewUrl: conf.previewUrl,
  },
};
export default state;
