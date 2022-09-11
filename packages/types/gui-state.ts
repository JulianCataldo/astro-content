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

/* —————————————————————————————————————————————————————————————————————————— */

interface PaneDimensions {
  height: number | null;
  width: number | null;
}
export interface UiState {
  ui_route: Route;
  ui_inspectorPane: string;
  ui_assistantPane: string;
  ui_splitPanes: {
    tree: PaneDimensions;
    file: PaneDimensions;
    assistant: PaneDimensions;
    inspector: PaneDimensions;
  };
  /* ········································································ */
  ui_save: (newState: Partial<UiState>) => void;
  ui_fetchSaved: () => void;
  /* ········································································ */
  ui_setRoute: (entity: Part, entry: Part, property: Part) => void;
  ui_setInspectorPane: (name: string) => void;
  ui_setAssistantPane: (name: string) => void;
  ui_setSplitPanesDimensions: (
    pane: keyof UiState['ui_splitPanes'],
    width?: number | null,
    height?: number | null,
  ) => void;
}

/* —————————————————————————————————————————————————————————————————————————— */

export interface DataState {
  data_server: ServerState;
  data_fetchServerData: () => Promise<void>;
}

/* —————————————————————————————————————————————————————————————————————————— */

export interface EditorState {
  editor_default: null | nsEd.IStandaloneCodeEditor;
  editor_language: Language | null;
  /* ········································································ */
  editor_save: () => void;
  editor_setDefault: (ref: nsEd.IStandaloneCodeEditor) => void;
  editor_updateContentForValidation: (
    entity: Part,
    entry: Part,
    property: Part,
    language: Language,
    value: string,
    schema: unknown,
  ) => Promise<void>;
  editor_setCurrentLanguage: (name: EditorLanguage) => void;
}

/* —————————————————————————————————————————————————————————————————————————— */

export type AppState = UiState & DataState & EditorState;
