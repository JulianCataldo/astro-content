/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { JSONSchema7 } from 'json-schema';
import type { Position } from 'unist';

export interface Content {
  [key: string]: {
    [key: string]: { [key: string]: unknown };
  };
}

export interface Schemas {
  internals?: { [key: string]: JSONSchema7 };
  content: { [key: string]: JSONSchema7 };
  raw?: { [key: string]: string };
}

export interface Types {
  common: string;
  browser: string;
  ide: string;
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

export interface PropertyErrors {
  schema: ErrorsSchema[];
  lint: ErrorsLint[];
  prose: ErrorsProse[];
}
export interface Errors {
  [key: string]: {
    [key: string]: {
      [key: string]: PropertyErrors;
    };
  };
}

export interface ServerState {
  content: Content | null;

  schemas: Schemas | null;

  errors: Errors | null;

  types: Types | null;

  config:
    | {
        previewUrl?: string;
      }
    | {}
    | null;
}
