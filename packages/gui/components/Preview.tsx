/* ·········································································· */
import TabBar from './TabBar';
import Editor from './Editor';
import Metas from './Metas';
/* ·········································································· */
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Entity() {
  const { content, schemas, types } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );
  const previewPane = useAppStore((state) => state.uiState.previewPane);
  const setPreviewPane = useAppStore((state) => state.setPreviewPane);

  const contentProp = property === 'content' ? 'contentProp' : property;
  const importHelpText = `import { get } from 'astro-content';

// Fetch everything
const allContent = await get(Astro.glob('/**/*.{md,mdx,yaml}'));

// Narrow to some entities, for performance
const content = await get(Astro.glob('/{${entity}}/**/*.{md,mdx,yaml}'));

// Get entity
const ${entity} = content?.${entity};

// Get entry
const ${entry} = content?.${entity}?.${entry};

// Get property (file)
const ${contentProp} = content?.${entity}?.${entry}?.${property};

// Hit \`Ctrl\` + \`Space\` ———————————v
const tryAutoCompletion = content?. ;


console.log({
  ${entity},
  ${entry},
  ${contentProp},
});
`;

  const value = content?.[entity]?.[entry]?.[property];
  const isMd = value?.headings && value?.rawMd;

  const tabs = {};

  if (value) {
    if (isMd) {
      tabs.preview = { button: { title: 'Preview' } };
      tabs.meta = { button: { title: 'Meta' } };
      tabs.html = { button: { title: 'HTML output' } };
    } else {
      tabs.preview = { button: { title: 'Preview (JSON)' } };
    }
    tabs.ts = { button: { title: 'Import (TS)' } };
    tabs.api = { button: { title: 'API response' } };
  } else if (entity && !entry) {
    tabs.preview = { button: { title: 'Preview (TS)' } };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    content && (
      <>
        <TabBar
          tabs={tabs}
          switchPane={setPreviewPane}
          currentTab={previewPane}
        />

        <div className="preview-entity">
          {schemas?.content[entity] && !content[entity][entry] && (
            <div className="preview">
              <div className="editor">
                <Editor
                  language="typescript"
                  value={types?.entity?.[entity]}
                  readOnly
                />
              </div>
            </div>
          )}
          {value && isMd && (
            <div className="preview">
              {previewPane === 'preview' && (
                <div
                  className="markdown markdown-preview"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: value?.body,
                  }}
                />
              )}
              {previewPane === 'meta' && <Metas value={value} />}
              {previewPane === 'ts' && (
                <div className="editor">
                  <Editor language="typescript" value={importHelpText} />
                </div>
              )}
              {previewPane === 'html' && (
                <div className="editor">
                  <Editor language="html" value={value?.body} readOnly />
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
              {previewPane === 'preview' && (
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
    )
  );
}
