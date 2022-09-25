// REFACTOR: Split in sub-components
/* eslint-disable max-lines */

import yaml from 'yaml';
import { useEffect, useRef, useState } from 'react';
// import 'github-markdown-css';
/* ·········································································· */
import type { Fake } from '@astro-content/types/dto';
import { endpoints } from '@astro-content/server/state';
import { log } from '../logger';
import TabBar, { Tabs } from './TabBar';
import Editor from './Editor/Editor';
// import Metas from './Metas'
/* ·········································································· */
import useAppStore from '../store';
// import './Assistant.scss';
import { post } from '../store/helpers';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Assistant() {
  const { content, schemas, types } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const language = useAppStore((state) => state.editor_language);
  const assistantPane = useAppStore((state) => state.ui_assistantPane);
  const setAssistantPane = useAppStore((state) => state.ui_setAssistantPane);
  const scrollPosition = useAppStore((state) => state.editor_scrollPosition);

  const contentProp = property === 'content' ? 'contentProp' : property;

  const title =
    // FIXME: No unnecessary condition
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    entity && typeof schemas.content[entity]?.title === 'string'
      ? String(schemas.content[entity].title)
      : '';

  const importHelpText =
    entity &&
    entry &&
    property &&
    contentProp &&
    `/* 🔽 Copy paste what you need in Astro templates of yours 🔽 */

// import { get } from '/content';
// import type { ${title}, Entities } from '/content';

// Fetch everything
const allContent = await get(Astro.glob('/content/**/*.{md,mdx,yaml}'));

// Start typing a '.' ——————————————v
const tryAutoCompletion = allContent ;

// Narrow to \`${entity}\` entity, for performance
const content = await get(Astro.glob('/content/${entity}/**/*.{md,mdx,yaml}'));

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

import { get } from '../../content';

*/

export {}`;

  const value =
    entity && entry && property && content[entity]?.[entry]?.[property];
  const isMd = language === 'markdown' || language === 'mdx';

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
    tabs.api = { icon: 'mdi:code-json', title: 'Object' };
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

  // FIXME: No unnecessary condition
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
      post(endpoints.actions.fake, dto)
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

  const previewWrapper = useRef<HTMLIFrameElement>(null);

  /* Sync. scroll position from editor (one-way) */
  useEffect(() => {
    const wrapperHeight = previewWrapper.current?.clientHeight;
    const scrollableHeight = previewWrapper.current?.scrollHeight;
    const top =
      ((scrollableHeight ?? 0) - (wrapperHeight ?? 0)) * scrollPosition;
    previewWrapper.current?.scrollTo({ top });
  }, [scrollPosition]);

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
        {entity && !entry && (
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
              (value.language === 'markdown' || value.language === 'mdx') && (
                <div className="markdown markdown-preview">
                  <iframe
                    title="Embedded preview"
                    src={`${endpoints.actions.render}/${encodeURIComponent(
                      value.file,
                    )}`}
                    frameBorder="none"
                    // FIXME: Scrollbar bi-directional sync.
                    // ref={previewWrapper}
                  />
                </div>
                // NOTE: Disabled. In-document MD rendering.
                // Might be useful to re-use this for MD only?
                // <div
                //   className="markdown markdown-preview"
                //   // eslint-disable-next-line react/no-danger
                //   dangerouslySetInnerHTML={{
                //     __html: value.bodyCompiled,
                //   }}
                //   ref={previewWrapper}
                // />
              )}
            {/* {assistantPane === 'meta' && (
                <Metas
                  value={value}
                  schema={frontmatterSchema}
                  errors={schemaErrors}
                />
              )} */}

            {assistantPane === 'html' &&
              (value.language === 'markdown' || value.language === 'mdx') && (
                <div className="editor">
                  <Editor language="html" value={value.raw} readOnly />
                </div>
              )}
            {/* {assistantPane === 'api' && <div className="editor"></div>} */}
          </>
        )}
        {value && (
          <>
            {assistantPane === 'preview' && value.language === 'yaml' && (
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
