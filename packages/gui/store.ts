/* eslint-disable max-lines */
/* eslint-disable arrow-body-style */

import create from 'zustand';
/* ·········································································· */
import type { SaveDTO } from '@astro-content/types/dto';
import type { AppState, Language, Part } from '@astro-content/types/gui-state';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

const apiBase = '/__content/api';

export async function fetchData() {
  $log('Fetching…');

  const endpointList = ['schemas', 'content', 'errors', 'types', 'config'];

  const data = {};
  await Promise.all(
    endpointList.map(async (key) =>
      fetch(`${apiBase}/${key}`).then((r) =>
        (key === 'types' ? r.text() : r.json())
          .then((j) => {
            data[key] = j;
          })
          .catch((e) => {
            data[key] = {};
            console.log(e);
          }),
      ),
    ),
  );
  return data;
}

type Part = string | null | false;
interface Route {
  entity: Part;
  entry: Part;
  property: Part;
}

interface Data {
  content: Content | null;
  schemas: Schemas | null;
  errors: Errors | null;
  types: string | null;
  config: { previewUrl: string } | null;
  // language: 'markdown' | 'yaml';
}

interface AppState {
  route: Route;
  setRoute: (route: [Part, Part, Part]) => void;
  fetchCurrentRoute: () => void;

  data: Data;
  fetchData: () => Promise<void>;

  defaultEditor: null | nsEd.IStandaloneCodeEditor;
  setDefaultEditor: (ref: nsEd.IStandaloneCodeEditor) => void;
}

const useAppStore = create<AppState>()((set) => ({
  route: {
    entity: null,
    entry: null,
    property: null,
    types: null,
    config: null,
  },
  setRoute: (entity: Part, entry: Part, property: Part) => {
    // const newRoute = [route.entity, route.entry, route.property].join('/');
    // window.history.pushState(null, '', `/${newRoute}`);

    set(() => {
      const route = { entity, entry, property };

      console.log(route);

      localStorage.setItem('route', JSON.stringify(route));
      return { route };
    });
  },
  fetchCurrentRoute: () => {
    set((state) => {
      const storage = localStorage.getItem('route');
      if (storage) {
        const route: Route = JSON.parse(storage) as Route;
        return { route };
      }
      return { route: state };
    });
  },

  data: {
    content: null,
    schemas: null,
    errors: null,
    types: null,
    config: null,
  },
  fetchData: async () => {
    const res = await fetchData().catch((_) => null);
    set(() => {
      return { data: res };
    });
  },

  defaultEditor: null,
  setDefaultEditor: (ref) => {
    set(() => {
      return { defaultEditor: ref };
    });
  },

  save: () => {
    const url = [apiBase, 'content'].join('/');

    set((state) => {
      let value;
      if (state.defaultEditor !== null) {
        value = state.defaultEditor.getValue();
      }

      const extension =
        state.defaultEditor._configuration._rawOptions.language === 'markdown'
          ? '.md'
          : '.yaml';

      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state.route,
          extension,
          value,
        }),
      })
        .then(() => null)
        .catch(() => null);
      return {};
    });
  },
}));

// eslint-disable-next-line import/prefer-default-export
export { useAppStore };
