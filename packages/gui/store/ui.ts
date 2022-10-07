import type { AppState, UiState } from '@astro-content/types/gui-state';
import type { StoreApi } from 'zustand';
import { log } from '../logger';
/* —————————————————————————————————————————————————————————————————————————— */

const uiState = (set: StoreApi<AppState>['setState']): UiState => ({
  ui_route: { entity: null, entry: null, property: null },
  ui_inspectorPane: 'schema',
  ui_assistantPane: 'preview',
  ui_splitPanes: {
    tree: { width: 0, height: 0 },
    file: { width: 0, height: 0 },
    assistant: { width: 0, height: 0 },
    inspector: { width: 0, height: 0 },
  },
  ui_commandPaletteVisibility: false,

  /* ········································································ */

  ui_save(newState) {
    set((state) => {
      const loadedState = {
        ui_route: newState.ui_route ?? state.ui_route,
        ui_inspectorPane: newState.ui_inspectorPane ?? state.ui_inspectorPane,
        ui_assistantPane: newState.ui_assistantPane ?? state.ui_assistantPane,
        ui_splitPanes: newState.ui_splitPanes ?? state.ui_splitPanes,
      };
      localStorage.setItem('uiState', JSON.stringify(loadedState));
      return {};
    });
  },

  /* ········································································ */

  ui_fetchSaved: () => {
    const storage = localStorage.getItem('uiState');
    if (storage) {
      const savedState = JSON.parse(storage) as Partial<UiState>;
      log({ fromLocal: uiState });
      set(
        (state) =>
          ({
            // ui_route: savedState.ui_route ?? state.ui_route,
            ui_inspectorPane:
              savedState.ui_inspectorPane ?? state.ui_inspectorPane,
            ui_assistantPane:
              savedState.ui_assistantPane ?? state.ui_assistantPane,
            ui_splitPanes: savedState.ui_splitPanes ?? state.ui_splitPanes,
          } as Partial<UiState>),
      );
    }
  },

  /* ········································································ */

  ui_setRoute: (entity, entry, property) => {
    // const newRoute = [route.entity, route.entry, route.property].join('/');
    // window.history.pushState(null, '', `/${newRoute}`);
    log({ entity, entry, property });

    set((state) => {
      const newUiState: Partial<UiState> = {
        ui_route: { entity, entry, property },
      };
      state.ui_save(newUiState);
      return newUiState;
    });
  },

  /* ········································································ */

  ui_setInspectorPane: (name) => {
    set((state) => {
      const newUiState: Partial<UiState> = {
        ui_inspectorPane: name || '',
      };
      state.ui_save(newUiState);
      return newUiState;
    });
  },

  /* ········································································ */

  ui_setAssistantPane: (name) => {
    set((state) => {
      const newUiState: Partial<UiState> = {
        ui_assistantPane: name || 'preview',
      };
      state.ui_save(newUiState);
      return newUiState;
    });
  },

  /* ········································································ */

  ui_setSplitPanesDimensions: (pane, width = null, height = null) => {
    // console.log({ newWidth });
    set((state) => {
      const newUiState: Partial<UiState> = {
        ui_splitPanes: {
          ...state.ui_splitPanes,
          [pane]: { width, height },
        },
      };
      // state.saveUi(newUiState);
      return newUiState;
    });
  },

  /* ········································································ */

  ui_showCommandPalette: () => {
    // log({ newWidth });
    // set((state) => {
    //   const newUiState: Partial<UiState> = {
    //     ui_commandPaletteVisibility: !state.ui_commandPaletteVisibility,
    //   };
    //   // state.saveUi(newUiState);
    //   return newUiState;
    // });
  },
});

export default uiState;
