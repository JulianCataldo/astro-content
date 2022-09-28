import type { StoreApi } from 'zustand';
/* ·········································································· */
import { endpoints } from '@astro-content/server/state';
import type { AppState, EditorState } from '@astro-content/types/gui-state';
import type { PropertyReport } from '@astro-content/types/reports';
import type { Save, Validate, Response } from '@astro-content/types/dto';
import { log } from '../logger';
import { post } from './helpers';
/* —————————————————————————————————————————————————————————————————————————— */

const editor = (set: StoreApi<AppState>['setState']): EditorState => ({
  editor_default: null,
  editor_language: null,
  editor_scrollPosition: 0,
  editor_savingState: 'idle',

  /* ········································································ */

  editor_setDefault: (ref) => {
    set(() => ({ editor_default: ref }));
  },

  /* ········································································ */

  editor_save: () => {
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
              // await fetch(endpoints.actions.refresh);
              // await fetch(endpoints.actions.refresh);

              /* Refresh local data */
              // FIXME: Adding delay to prevent jerkyness with empty data,
              // but should really find a better signal to hook on when ready
              // await state
              //   .data_fetchServerData()
              //   .then(() => null)
              //   .catch(() => null);
              await new Promise((resolve) => {
                setTimeout(() => {
                  state
                    .data_fetchServerData()
                    .then(() => resolve(''))
                    .catch(() => null);
                }, 100);
              });

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
    entity,
    entry,
    property,
    language,
    value,
    schema,
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

    // FIXME:
    set((state) => {
      const newStateErrors = state.data_server.reports;
      if (
        entity &&
        entry &&
        property &&
        reports &&
        newStateErrors[entity]?.[entry]?.[property]
      ) {
        // FIXME: Possibly undefined
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        newStateErrors[entity][entry][property] = reports;
      }

      return { data: { ...state.data_server, reports: newStateErrors } };
    });
  },

  /* ········································································ */

  editor_setCurrentLanguage: (id) => {
    set((state) => {
      const newUiState: Partial<AppState> = {
        editor_language: id,
      };
      state.ui_save(newUiState);
      return newUiState;
    });
  },

  /* ········································································ */

  editor_setScrollPosition: (
    wrapperHeight,
    scrollableHeight,
    currentScroll,
  ) => {
    log({ wrapperHeight, scrollableHeight, currentScroll }, 'absurd');
    set((state) => {
      const percentage = currentScroll / (scrollableHeight - wrapperHeight);

      const accuracy = 10000;
      const pRounded = Math.round(percentage * accuracy) / accuracy;

      const newUiState: Partial<AppState> = {
        editor_scrollPosition: pRounded,
      };
      state.ui_save(newUiState);
      return newUiState;
    });
  },
});

export default editor;
