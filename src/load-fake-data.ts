import jsf from 'json-schema-faker';
import { camelCase } from 'lodash-es';
import randomWords from 'random-words';
/* ·········································································· */
import { conf } from './config';
import state from './state';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function loadFakeData() {
  const definitions = state.schemas.internals;
  const schema = { definitions, ...state.schemas.content?.articles };

  const entries = {};

  const dummyArray = Array.from({ length: conf.fake.entriesCount });
  await Promise.all(
    dummyArray.map(async () => {
      const entryFileName = camelCase(randomWords(4).join('-'));
      const fakeEntry = await jsf.resolve(schema);

      entries[entryFileName] = fakeEntry;
    }),
  );

  state.content.articles.items = entries;
}
