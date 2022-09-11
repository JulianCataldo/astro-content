import type { StoreApi } from 'zustand';
/* ·········································································· */
import type { Endpoint, ServerState } from '@astro-content/types/server-state';
import type { AppState, DataState } from '@astro-content/types/gui-state';
import { apiBase, endpoints, getEmptyState } from '@astro-content/server/state';
/* ·········································································· */
import { log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

export async function fetchData() {
  log('Fetching…');

  const data: ServerState = getEmptyState();

  function setData<T extends Endpoint>(endpoint: T, newData: unknown) {
    data[endpoint] = newData as ServerState[T];
  }

  await Promise.all(
    endpoints.map(async (endpoint: keyof ServerState) =>
      fetch(`${apiBase}/${endpoint}`).then((response) =>
        response
          .json()
          .then((newData) => setData(endpoint, newData))
          .catch((error) => log(error, 'info')),
      ),
    ),
  );
  return data;
}

const data = (set: StoreApi<AppState>['setState']): DataState => ({
  data_server: getEmptyState(),

  /* ········································································ */

  data_fetchServerData: async () => {
    const result = await fetchData()
      .then((ss: ServerState) => ss)
      .catch(() => null);

    if (result) {
      set((state) => {
        // IDEA: default route if no previous file selected?
        // const newUiSate = { ...state.uiState };
        if (!state.ui_route.entity) {
          // newUiSate.route.entity = '__previous-file__';
        }
        return { data_server: result };
      });
    }
  },
});

export default data;
