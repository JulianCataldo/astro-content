/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { JSONSchema7 } from 'json-schema';
import type { Position } from 'unist';

export interface Content {
  [key: string]: {
    type: 'singleton' | 'collection';
    data?: { [key: string]: unknown };
    items?: { [key: string]: { [key: string]: unknown } };
  };
}

export interface Schemas {
  internals: { [key: string]: JSONSchema7 };
  content: { [key: string]: JSONSchema7 };
  raw: { [key: string]: string };
}

export interface Types {
  entity: { [key: string]: string };
  browser: string;
}

export interface ErrorsSchema {
  [key: string]: unknown;
  position?: Position;
}
export interface ErrorsLint {
  [key: string]: unknown;
  position?: Position;
}
export interface ErrorsProse {
  [key: string]: unknown;
  position?: Position;
}

export interface Errors {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        schema: ErrorsSchema[];
        lint: ErrorsLint[];
        prose: ErrorsProse[];
      };
    };
  };
}

export interface ServerState {
  content: Content;

  schemas: Schemas;

  errors: Errors;

  types: Types;

  config: {
    previewUrl: string;
  };
}
