import { kebabCase } from 'lodash-es';
import type { StoreApi } from 'zustand';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import type { AppState, Language, Part } from '@astro-content/types/gui-state';
import type { PropertyReport } from '@astro-content/types/server-state';
import type { Save, Validate } from '@astro-content/types/dto';
import { log } from '../utils';
// import { $log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

const apiBase = '/__content/api';

const editor = (set: StoreApi<AppState>['setState']) => ({
  defaultEditor: null,

  setDefaultEditor: (ref: AppState['defaultEditor']) => {
    set(() => ({ defaultEditor: ref }));
  },

  /* ········································································ */

  save: () => {
    const url = [apiBase, '~save'].join('/');

    set((state) => {
      let value;
      if (state.defaultEditor !== null) {
        value = state.defaultEditor.getValue();
      } else {
        /* Abandon further actions */
        value = '…';
        log('Empty');
        return {};
      }

      // FIXME:
      const singular = kebabCase(
        state.data.schemas.content[state.uiState.route.entity].title,
      );
      const { entity, entry, property } = state.uiState.route;
      const DTO: Save = {
        // ...state.uiState.route,
        // FIXME:
        file: state.data.content[entity][entry][property].file,
        language: state.uiState.language,
        singular,
        value,
      };

      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DTO),
      })
        .then((e) => log(e))
        .catch((e) => log(e));
      return {};
    });
  },

  /* ········································································ */

  updateContentForValidation: async (
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

    const url = [apiBase, '~validate'].join('/');

    const Dto = {
      entity,
      entry,
      property,
      schema,
      value,
      language,
    } as Validate;

    const errors = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Dto),
    })
      .then((e) =>
        e
          .json()
          .then(({ errors: j }) => j as PropertyReport)
          .catch((err) => log(err)),
      )
      .catch((err) => {
        log(err);
        return null;
      });

    set((state) => {
      const newStateErrors = state.data.errors;

      if (
        entity &&
        entry &&
        property &&
        errors &&
        newStateErrors[entity]?.[entry]?.[property]
      ) {
        newStateErrors[entity][entry][property] = {
          ...state.data.errors[entity][entry][property],
          ...errors,
        };

        log({ new: newStateErrors[entity][entry][property] });
      }

      return { data: { ...state.data, errors: newStateErrors } };
    });
  },
});

export default editor;
