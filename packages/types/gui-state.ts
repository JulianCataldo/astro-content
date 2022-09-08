import type { editor as nsEd } from 'monaco-editor';
/* ·········································································· */
import type { ServerState } from './server-state';
/* —————————————————————————————————————————————————————————————————————————— */

export type Part = string | null | false;
export interface Route {
  entity: Part;
  entry: Part;
  property: Part;
}

export type Language = 'yaml' | 'markdown';

export type EditorLanguage = Language | ('typescript' | 'json' | 'html');

export interface UiState {
  route: Route;
  inspectorPane: string;
  previewPane: string;
  language: Language | null;
}

export interface AppState {
  uiState: UiState;
  saveUiState: (newState: UiState) => void;
  fetchSavedUiState: () => void;
  /* ········································································ */
  setRoute: (entity: Part, entry: Part, property: Part) => void;
  setInspectorPane: (name: string) => void;
  setPreviewPane: (name: string) => void;
  setCurrentLanguage: (name: EditorLanguage) => void;
  /* ········································································ */
  data: ServerState;
  fetchData: () => Promise<void>;
  /* ········································································ */
  updateContentForValidation: (
    entity: Part,
    entry: Part,
    property: Part,
    language: Language,
    value: string,
    schema: unknown,
  ) => Promise<void>;
  save: () => void;
  defaultEditor: null | nsEd.IStandaloneCodeEditor;
  setDefaultEditor: (ref: nsEd.IStandaloneCodeEditor) => void;
}
