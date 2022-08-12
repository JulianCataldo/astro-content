import { JSONSchema } from 'json-schema-to-typescript';

const state = {
  content: {} as {
    [key: string]: {
      type: 'singleton' | 'collection';
      data?: { [key: string]: unknown };
      items?: { [key: string]: { [key: string]: unknown } };
    };
  },

  schemas: {
    internals: {} as { [key: string]: JSONSchema },
    content: {} as { [key: string]: JSONSchema },
  },

  errors: {} as {
    [key: string]: unknown;
  },
};

export default state;
