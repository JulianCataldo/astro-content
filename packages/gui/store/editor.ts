import { kebabCase } from 'lodash-es';
import type { StoreApi } from 'zustand';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { endpoints } from '@astro-content/server/state';
import type {
  AppState,
  Language,
  Part,
  EditorState,
} from '@astro-content/types/gui-state';
import type { PropertyReport } from '@astro-content/types/reports';
import type { Save, Validate } from '@astro-content/types/dto';
import { log } from '../logger';
import { post } from './helpers';
/* —————————————————————————————————————————————————————————————————————————— */

const editor = (set: StoreApi<AppState>['setState']): EditorState => ({
  editor_default: null,
  editor_language: null,
  editor_savingState: 'idle',

  editor_setDefault: (ref: AppState['editor_default']) => {
    set(() => ({ editor_default: ref }));
  },

  /* ········································································ */

  editor_save: async () => {
    // if (import.meta.env.PROD) return false;

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

      let file = '';
      if (
        entity &&
        entry &&
        property &&
        state.data_server.content[entity]?.[entry]?.[property]?.file
      ) {
        file =
          state.data_server.content[entity]?.[entry]?.[property]?.file ?? '';
      } else if (entity && state.data_server.schemas.file[entity]) {
        file = state.data_server.schemas.file[entity];
      }

      // let singular = '';
      const dto: Save = {
        file,
        language: state.editor_language,
        singular: '',
        value,
      };

      if (state.editor_savingState === 'idle') {
        set(() => ({ editor_savingState: 'busy' }));
      }

      const result = post(endpoints.actions.save, dto)
        .then(async (stream) => {
          // TODO: Extract JSON parsing to `post` helper
          await stream.json().then(async ({ success }: Response) => {
            log({ success });
            if (success) {
              /* Trigger `Astro.glob` + `collect`, so Astro transform updates */
              await fetch(endpoints.actions.refresh);

              /* Refresh local data */
              // FIXME: Adding delay to prevent jerkyness with empty data,
              // but should really find a better signal to hook on when ready
              await new Promise((resolve) =>
                setTimeout(
                  async () =>
                    await state.data_fetchServerData().then(() => resolve('')),
                  200,
                ),
              );

              log("Fetching new data after save…'");
            }
            set(() => ({
              editor_savingState: success ? 'success' : 'failure',
            }));

            setTimeout(
              () =>
                set(() => ({
                  editor_savingState: 'idle',
                })),
              2500,
            );
          });
        })
        .catch((e) => log(e, 'info'));

      return result;
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

    const reports = await post(endpoints.actions.validate, dto)
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
