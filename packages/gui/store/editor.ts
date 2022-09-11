import { kebabCase } from 'lodash-es';
import type { StoreApi } from 'zustand';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { actions, apiBase } from '@astro-content/server/state';
import type {
  AppState,
  Language,
  Part,
  EditorState,
} from '@astro-content/types/gui-state';
import type { PropertyReport } from '@astro-content/types/reports';
import type { Save, Validate } from '@astro-content/types/dto';
import { log, put } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

const editor = (set: StoreApi<AppState>['setState']): EditorState => ({
  editor_default: null,
  editor_language: null,

  editor_setDefault: (ref: AppState['editor_default']) => {
    set(() => ({ editor_default: ref }));
  },

  /* ········································································ */

  editor_save: () => {
    set((state) => {
      let value;
      if (state.editor_default !== null) {
        value = state.editor_default.getValue();
      } else {
        /* Abandon further actions */
        value = '…';
        log('Empty');
        return {};
      }
      const { entity, entry, property } = state.ui_route;

      let singular = '';
      if (state.ui_route.entity) {
        singular = kebabCase(
          state.data_server.schemas.content[state.ui_route.entity].title,
        );
      }
      let file = '';
      if (
        entity &&
        entry &&
        property &&
        state.data_server.content[entity]?.[entry]?.[property]?.file
      ) {
        file =
          state.data_server.content[entity]?.[entry]?.[property]?.file ?? '';
      }
      const dto: Save = {
        file,
        language: state.editor_language,
        singular,
        value,
      };

      // TODO: Add notification
      // await Notification.requestPermission();
      // new Notification('');
      put(actions.save.endpoint, dto)
        .then(
          // async
          (e) => {
            log(e);
          },
        )
        .catch((e) => log(e, 'info'));

      return {};
    });
  },

  /* ········································································ */

  editor_updateContentForValidation: async (
    entity: Part,
    entry: Part,
    property: Part,
    language: Language,
    value: string,
    schema: JSONSchema7,
  ) => {
    log(
      {
        validate: { entity, entry, property, value, schema },
      },
      'debug',
    );

    const dto = {
      entity,
      entry,
      property,
      schema,
      value,
      language,
    } as Validate;

    const reports = await put(actions.validate.endpoint, dto)
      .then((r) =>
        r
          .json()
          .then(({ reports: j }) => j as PropertyReport)
          .catch((err) => log(err)),
      )
      .catch((err) => {
        log(err);
        return null;
      });

    set((state) => {
      const newStateErrors = state.data_server.reports;
      if (
        entity &&
        entry &&
        property &&
        reports &&
        newStateErrors[entity]?.[entry]?.[property]
      ) {
        // FIXME:
        newStateErrors[entity][entry][property] = reports;
        //   log({ new: newStateErrors[entity][entry][property] });
      }

      return { data: { ...state.data_server, reports: newStateErrors } };
    });
  },

  /* ········································································ */

  editor_setCurrentLanguage: (id: Language) => {
    set((state) => {
      const newUiState: Partial<AppState> = {
        editor_language: id,
      };
      state.ui_save(newUiState);
      return newUiState;
    });
  },
});

export default editor;
