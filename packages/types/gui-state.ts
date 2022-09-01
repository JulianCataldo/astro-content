import type { editor as nsEd } from 'monaco-editor';

import type { Content, Errors, Schemas, Types } from './server-state';

export type Part = string | null | false;
export interface Route {
  entity: Part;
  entry: Part;
  property: Part;
}

export interface Data {
  content: Content;
  schemas: Schemas | null;
  errors: Errors;
  types: Types;
  config: { previewUrl: string };
}
export type Language = 'yaml' | 'md';

export interface AppState {
  uiState: {
    route: Route;
    inspectorPane: string;
    previewPane: string;
    language: Language | null;
  };
  // saveUiState: () => void;
  fetchSavedUiState: () => void;
  /* ········································································ */
  setRoute: (entity: Part, entry: Part, property: Part) => void;
  setInspectorPane: (name: string) => void;
  setPreviewPane: (name: string) => void;
  setCurrentLanguage: (name: Language) => void;
  /* ········································································ */
  data: Data;
  fetchData: () => Promise<void>;
  updateContentForValidation: (
    entity: Part,
    entry: Part,
    property: Part,
    language: Language,
    value: string,
    schema: unknown,
  ) => Promise<void>;
  save: () => void;
  /* ········································································ */
  defaultEditor: null | nsEd.IStandaloneCodeEditor;
  setDefaultEditor: (ref: nsEd.IStandaloneCodeEditor) => void;
}
