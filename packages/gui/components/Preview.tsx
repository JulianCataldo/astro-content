import { useState } from 'react';
import { pascalCase } from 'change-case';
/* ·········································································· */
import TabBar from './TabBar';
import Editor from './Editor';
import Metas from './Metas';
/* ·········································································· */
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Entity() {
  const { content, schemas } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore((state) => state.route);

  const [currentPane, setCurrentPane] = useState(0);
  function switchPane(index) {
    setCurrentPane(index);
  }

  const importHelpText = `import content from 'content/get';

const ${entity}_Entity = await content('${entity}');
// Yields \`${pascalCase(entity || '')}\`

const ${entry}_Entry = ${entity}_Entity?.${entry};
// Yields \`${pascalCase(entity || '')}['${entry}']\`

const ${property}_Prop = ${entity}_Entity?.${entry}?.${property};
// Yields \`${pascalCase(entity || '')}['${entry}']['${property}']\`


console.log({
  ${entity}_Entity,
  ${entry}_Entry,
  ${property}_Prop,
  ${entity}_Array
});
`;

  const value = content?.[entity]?.[entry]?.[property];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    content && (
      <>
        <TabBar
          tabs={[
            { button: { title: 'Preview' } },
            { button: { title: 'Meta' } },
            { button: { title: 'Import (TS)' } },
            { button: { title: 'HTML output' } },
            { button: { title: 'API response' } },
          ]}
          switchPane={switchPane}
          currentTab={currentPane}
        />
        {schemas?.content[entity] && !content[entity][entry] && (
          <div className="editor">
            <h2>Schema</h2>
            <Editor
              language="json"
              value={JSON.stringify(schemas?.content[entity], null, 2)}
              readOnly
            />
          </div>
        )}

        <div className="preview-entity">
          {value &&
            (value?.headings ? (
              <div className="preview">
                {currentPane === 0 && (
                  <div
                    className="markdown markdown-preview"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: value?.body,
                    }}
                  />
                )}
                {currentPane === 1 && <Metas value={value} />}
                {currentPane === 2 && (
                  <div className="editor">
                    <Editor language="typescript" value={importHelpText} />
                  </div>
                )}
                {currentPane === 3 && (
                  <div className="editor">
                    <Editor language="html" value={value?.body} readOnly />
                  </div>
                )}
                {currentPane === 4 && (
                  <div className="editor">
                    <Editor
                      language="json"
                      value={JSON.stringify(value, null, 2)}
                      readOnly
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="preview">
                {currentPane === 0 && (
                  <Editor
                    language="json"
                    value={JSON.stringify(value.object, null, 2)}
                  />
                )}
                {currentPane === 4 && (
                  <Editor
                    language="json"
                    value={JSON.stringify(value.object, null, 2)}
                    readOnly
                  />
                )}
              </div>
            ))}
        </div>
      </>
    )
  );
}
