// REFACTOR: Split in sub-components
/* eslint-disable max-lines */

import yaml from 'yaml';
import { useEffect, useState } from 'react';
/* ·········································································· */
import type { Fake } from '@astro-content/types/dto';
import { log } from '../utils';
import TabBar, { Tabs } from './TabBar';
import Editor from './Editor';
// import Metas from './Metas';
/* ·········································································· */
import useAppStore from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Preview() {
  const { content, schemas, types } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );
  const language = useAppStore((state) => state.uiState.language);
  const previewPane = useAppStore((state) => state.uiState.previewPane);
  const setPreviewPane = useAppStore((state) => state.setPreviewPane);

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
    tabs.api = { icon: 'mdi:code-json', title: 'API response' };
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
  if (!tabs[previewPane]) {
    setPreviewPane('preview');
  }

  const [fakeEntries, setFakeEntriesObj] = useState<unknown>({});

  useEffect(() => {
    if (entity) {
      const Dto: Fake = {
        schema: {
          definitions: { ...schemas.internals },
          ...schemas.content[entity],
        },
      };

      fetch('/__content/api/~fake', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Dto),
      })
        .then((r) =>
          r
            .json()
            .then((j: unknown) => {
              log(j, 'absurd');
              setFakeEntriesObj(j);
            })
            .catch(() => null),
        )
        .catch((e) => log(e));
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
        switchPane={setPreviewPane}
        currentTab={previewPane}
        defaultTab="preview"
      />
      <div className="preview-entity">
        {/* {previewPane} */}
        {entity && entry && !content[entity]?.[entry] && (
          <div className="preview">
            {previewPane === 'ts' && (
              <div className="editor">
                <Editor language="typescript" value={typesPrev} readOnly />
              </div>
            )}
            {previewPane === 'preview' && (
              <div className="editor">
                <Editor
                  language="yaml"
                  value={yaml.stringify(fakeEntries)}
                  readOnly
                />
              </div>
            )}
          </div>
        )}
        {previewPane === 'ts' && importHelpText && (
          <div className="editor">
            <Editor language="typescript" value={importHelpText} />
          </div>
        )}

        {value && isMd && (
          <div className="preview">
            {previewPane === 'preview' &&
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
            {/* {previewPane === 'meta' && (
                <Metas
                  value={value}
                  schema={frontmatterSchema}
                  errors={schemaErrors}
                />
              )} */}

            {previewPane === 'html' &&
              'bodyCompiled' in value &&
              value.bodyCompiled && (
                <div className="editor">
                  <Editor language="html" value={value.bodyCompiled} readOnly />
                </div>
              )}
            {previewPane === 'api' && (
              <div className="editor">
                <Editor
                  language="json"
                  value={JSON.stringify(value, null, 2)}
                  readOnly
                />
              </div>
            )}
          </div>
        )}
        {value && (
          <div className="preview">
            {previewPane === 'preview' && 'data' in value && (
              <Editor
                language="json"
                value={JSON.stringify(value.data, null, 2)}
              />
            )}
            {previewPane === 'api' && (
              <Editor
                language="json"
                value={JSON.stringify(value, null, 2)}
                readOnly
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
