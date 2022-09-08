import type {
  AppState,
  Language,
  Part,
  UiState,
} from '@astro-content/types/gui-state';
import type { StoreApi } from 'zustand';
import { log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

const uiState = (set: StoreApi<AppState>['setState']) => ({
  uiState: {
    route: { entity: null, entry: null, property: null },
    language: null,
    inspectorPane: 'schema',
    previewPane: 'preview',
  },

  /* ········································································ */

  saveUiState(newState: UiState) {
    localStorage.setItem('uiState', JSON.stringify(newState));
  },

  /* ········································································ */

  fetchSavedUiState: () => {
    const storage = localStorage.getItem('uiState');
    if (storage) {
      const savedState = JSON.parse(storage) as AppState['uiState'];
      log({ fromLocal: uiState });
      set(() => ({ uiState: savedState }));
    }
  },

  /* ········································································ */

  setRoute: (entity: Part, entry: Part, property: Part) => {
    // const newRoute = [route.entity, route.entry, route.property].join('/');
    // window.history.pushState(null, '', `/${newRoute}`);
    log({ entity, entry, property });

    set((state) => {
      log(state.data.errors['invoices']['amdPortal']['contract']);
      const newUiState: AppState['uiState'] = {
        ...state.uiState,
        route: { entity, entry, property },
      };
      state.saveUiState(newUiState);
      return { uiState: newUiState };
    });
  },

  /* ········································································ */

  setInspectorPane: (name: string) => {
    set((state) => {
      const newUiState: AppState['uiState'] = {
        ...state.uiState,
        inspectorPane: name,
      };
      state.saveUiState(newUiState);
      return { uiState: newUiState };
    });
  },

  /* ········································································ */

  setPreviewPane: (name: string) => {
    set((state) => {
      const newUiState: AppState['uiState'] = {
        ...state.uiState,
        previewPane: name || 'preview',
      };
      state.saveUiState(newUiState);
      return { uiState: newUiState };
    });
  },

  /* ········································································ */

  setCurrentLanguage: (id: Language) => {
    set((state) => {
      const newUiState: AppState['uiState'] = {
        ...state.uiState,
        language: id,
      };
      state.saveUiState(newUiState);
      return { uiState: newUiState };
    });
  },
});

export default uiState;
