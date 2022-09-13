import type { JSONSchema7 } from 'json-schema';
import type { Part } from './gui-state';

export interface Save {
  file: string;
  singular: string;
  value: string;
  language: string | null;
}

export interface Response {
  success: boolean;
}

export interface Validate {
  entity: Part;
  entry: Part;
  property: Part;
  schema: JSONSchema7;
  value: string;
  language: string | null;
}

export interface Fake {
  schema: JSONSchema7;
}
