// REFACTOR: Split in sub-components
/* eslint-disable max-lines */

import yaml from 'yaml';
import { useEffect, useState } from 'react';
import 'github-markdown-css';
/* ·········································································· */
import type { Fake } from '@astro-content/types/dto';
import { actions } from '@astro-content/server/state';
import { log } from '../logger';
import TabBar, { Tabs } from './TabBar';
import Editor from './Editor/Editor';
// import Metas from './Metas'
/* ·········································································· */
import useAppStore from '../store';
import './Assistant.scss';
import { post } from '../store/helpers';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Preview() {
  const { content, schemas, types } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const language = useAppStore((state) => state.editor_language);
  const assistantPane = useAppStore((state) => state.ui_assistantPane);
  const setAssistantPane = useAppStore((state) => state.ui_setAssistantPane);

  const contentProp = property === 'content' ? 'contentProp' : property;

  const title =
    // FIXME:
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    entity && typeof schemas.content[entity]?.title === 'string'
      ? String(schemas.content[entity].title)
      : '';

  const importHelpText =
    entity &&
    entry &&
    property &&
    contentProp &&
    `// import { get } from '/content';
// import type { ${title}, Entities } from '/content';

// Fetch everything
const allContent = await get(Astro.glob('/**/*.{md,mdx,yaml}'));

// Start typing a '.' ——————————————v
const tryAutoCompletion = allContent ;

// Narrow to some entities, for performance
const content = await get(Astro.glob('/{${entity}}/**/*.{md,mdx,yaml}'));

// Get entity
const ${entity} = content?.${entity};

// Get entry
const ${entry} = content?.${entity}?.${entry};

// Get property (file)
const ${contentProp} = content?.${entity}?.${entry}?.${property};


console.log({
  ${entity},
  ${entry},
  ${contentProp},
});



/* Import helper

- With alias in \`./tsconfig.json\`:

{
  "paths": {
    "/content": ["./content"]
  }
}

(Makes TS happy)

Then:

import { get } from '/content';

——— OR ———

relatively, from your \`./src/pages\` folder:

import { get } from '../../content/get';

*/

export {}`;

  const value =
    entity && entry && property && content[entity]?.[entry]?.[property];
  const isMd = language === 'markdown';

  const tabs: Tabs = {};

  if (value) {
    if (isMd) {
      tabs.preview = {
        icon: 'system-uicons:eye',
        title: 'Preview',
      };
    } else {
      tabs.preview = { icon: 'mdi:code-json', title: 'JSON' };
    }
    // tabs.meta = { icon: 'system-uicons:table', title: 'Meta' };
    if (isMd) {
      tabs.html = { icon: 'system-uicons:code', title: 'HTML' };
    }
    tabs.ts = { icon: 'simple-icons:typescript', title: 'Import' };
    tabs.api = { icon: 'mdi:code-json', title: 'API response' };
  } else if (entity && !entry) {
    tabs.preview = {
      icon: 'ion:dice',
      title: 'Fake',
    };
    tabs.ts = {
      icon: 'simple-icons:typescript',
      title: 'Types',
    };
  }

  const typesPrev = `/* Interfaces */\n${types.common.substring(1)}${
    types.ide.split('/* Interfaces */')[1]
  }`.trim();

  // FIXME:
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!tabs[assistantPane]) {
    setAssistantPane('preview');
  }

  const [fakeEntries, setFakeEntriesObj] = useState<unknown>({});

  useEffect(() => {
    if (entity) {
      const dto: Fake = {
        schema: {
          definitions: { ...schemas.internals },
          ...schemas.content[entity],
        },
      };

      // TODO: Extract to a `store` action
      // post(actions.fake.endpoint, dto)
      //   .then((r) =>
      //     r
      //       .json()
      //       .then((j: unknown) => {
      //         log(j, 'absurd');
      //         setFakeEntriesObj(j);
      //       })
      //       .catch(() => null),
      //   )
      //   .catch((e) => log(e));
    }
  }, [schemas.content]);

  // const frontmatterSchema =
  //   schemas.content?.[entity]?.properties?.[property]?.allOf?.[1]?.properties
  //     ?.frontmatter;
  // const schemaErrors = errors?.[entity]?.[entry]?.[property]?.schema;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    <>
      <TabBar
        tabs={tabs}
        switchPane={setAssistantPane}
        currentTab={assistantPane}
        defaultTab="preview"
      />
      <div className="component-assistant">
        {/* {assistantPane} */}
        {entity && entry && !content[entity]?.[entry] && (
          <>
            {assistantPane === 'ts' && (
              <div className="editor">
                <Editor language="typescript" value={typesPrev} readOnly />
              </div>
            )}
            {assistantPane === 'preview' && (
              <div className="editor">
                <Editor
                  language="yaml"
                  value={yaml.stringify(fakeEntries)}
                  readOnly
                />
              </div>
            )}
          </>
        )}
        {assistantPane === 'ts' && importHelpText && (
          <div className="editor">
            <Editor language="typescript" value={importHelpText} />
          </div>
        )}

        {value && isMd && (
          <>
            {assistantPane === 'preview' &&
              'bodyCompiled' in value &&
              value.bodyCompiled && (
                <div
                  className="markdown markdown-preview"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: value.bodyCompiled,
                  }}
                />
              )}
            {/* {assistantPane === 'meta' && (
                <Metas
                  value={value}
                  schema={frontmatterSchema}
                  errors={schemaErrors}
                />
              )} */}

            {assistantPane === 'html' &&
              'bodyCompiled' in value &&
              value.bodyCompiled && (
                <div className="editor">
                  <Editor language="html" value={value.bodyCompiled} readOnly />
                </div>
              )}
            {/* {assistantPane === 'api' && <div className="editor"></div>} */}
          </>
        )}
        {value && (
          <>
            {assistantPane === 'preview' && 'data' in value && (
              <div className="editor">
                <Editor
                  language="json"
                  value={JSON.stringify(value.data, null, 2)}
                />
              </div>
            )}
            {assistantPane === 'api' && (
              <div className="editor">
                <Editor
                  language="json"
                  value={JSON.stringify(value, null, 2)}
                  readOnly
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
