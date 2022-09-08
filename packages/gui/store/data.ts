import type { StoreApi } from 'zustand';
/* ·········································································· */
import type { ServerState } from '@astro-content/types/server-state';
import type { AppState } from '@astro-content/types/gui-state';
import { endpoints } from '@astro-content/server/state';
/* ·········································································· */
import { log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

const emptyDataSate: ServerState = {
  content: {},

  schemas: {
    content: {},
    raw: {},
    internals: {},
  },

  errors: {},

  types: {
    common: '',
    ide: '',
    browser: '',
  },

  config: {
    previewUrl: '/',
  },
};

const apiBase = '/__content/api';

export async function fetchData() {
  // log('Fetching…');

  const data: ServerState = { ...emptyDataSate };
  await Promise.all(
    endpoints.map(async (key: keyof ServerState) =>
      fetch(`${apiBase}/${key}`).then((r) =>
        r
          .json()
          .then((j) => {
            // FIXME:
            data[key] = j;
          })
          .catch((e) => {
            log(e);
          }),
      ),
    ),
  );
  return data;
}

const data = (set: StoreApi<AppState>['setState']) => ({
  data: emptyDataSate,

  /* ········································································ */

  fetchData: async () => {
    const res = await fetchData()
      .then((s: ServerState) => s)
      .catch(() => null);

    if (typeof res === 'object' && res) {
      set((state) => {
        // IDEA: default route if no previous file selected?
        // const newUiSate = { ...state.uiState };
        if (!state.uiState.route.entity) {
          // newUiSate.route.entity = '__previous-file__';
        }
        return { data: res };
      });
    }
  },
});

export default data;
