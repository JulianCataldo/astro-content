/* eslint-disable max-lines */
import type { Position } from 'unist';
import { Icon } from '@iconify/react';
import type { Reports } from '@astro-content/types/reports';
/* ·········································································· */
import useAppStore from '../store';
import TabBar, { Tabs } from './TabBar';
import Tooltip from './Tooltip';
import { log } from '../utils';
import './Inspector.scss';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Inspector() {
  const { content, reports } = useAppStore((state) => state.data_server);
  const inspectorPane = useAppStore((state) => state.ui_inspectorPane);
  const language = useAppStore((state) => state.editor_language);
  const setInspectorPane = useAppStore((state) => state.ui_setInspectorPane);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);

  const defaultEditor = useAppStore((state) => state.editor_default);

  function jumpToCode(position: Position) {
    log({ position });
    const editor = defaultEditor;

    if (editor) {
      editor.focus();
      // TODO: VS Code doesn't set the cursor as Monaco does, but make a nice highlight
      const posConvert = {
        lineNumber: position.end.line || position.start.line,
        column: position.end.column || position.start.column,
      };
      editor.setPosition(posConvert);
      editor.revealPositionInCenterIfOutsideViewport(posConvert);
    }
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function ErrorPane({ reps = [] }: { reps: Reports | undefined }) {
    return (
      <div className="reports-pane">
        <div className="row header">
          {/* Empty header column */}
          <div> </div>
          {inspectorPane === 'schema' && (
            <>
              <div>Location</div>
              <div>Keyword</div>
              <div>Missing property</div>
              <div>Message</div>
              {/* <div>Full message</div> */}
            </>
          )}

          {(inspectorPane === 'lint' || inspectorPane === 'prose') && (
            <>
              <div>Message</div>
              <div>Rule</div>
            </>
          )}

          {inspectorPane === 'footnotes' && (
            <>
              <div>Type</div>
              {/* <div>Label</div> */}
              <div>Identifier</div>
              <div>Definition</div>
            </>
          )}

          {inspectorPane === 'links' && (
            <>
              <div>HREF</div>
              <div>Content</div>
              <div>Title</div>
            </>
          )}
        </div>
        {Array.isArray(reps) &&
          reps.map((error, key) => (
            // FIXME: JSX Ally
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={key}
              className={`row ${error.position?.start.line ? 'jumper' : ''}`}
              onClick={() =>
                error.position ? jumpToCode(error.position) : null
              }
            >
              {error.position?.start.line ? (
                <Icon
                  icon="system-uicons:arrow-top-right"
                  width="1em"
                  height="1em"
                />
              ) : (
                <div />
              )}

              {inspectorPane === 'schema' && 'schemaPath' in error && (
                <>
                  {typeof error.schemaPath === 'string' && (
                    <div>{error.schemaPath}</div>
                  )}
                  {typeof error.keyword === 'string' && (
                    <div>{error.keyword}</div>
                  )}
                  {typeof error.params === 'object' &&
                    typeof error.params.missingProperty === 'string' && (
                      <div>{error.params.missingProperty}</div>
                    )}
                </>
              )}

              {'message' in error && <div>{error.message}</div>}
              {'note' in error && <div>{error.note}</div>}

              {'html' in error &&
                'label' in error &&
                inspectorPane === 'footnotes' && (
                  <>
                    <div>Definition</div>
                    {error.label && <div>{error.label}</div>}
                    {error.html && (
                      // eslint-disable-next-line react/no-danger
                      <div dangerouslySetInnerHTML={{ __html: error.html }} />
                    )}
                  </>
                )}
              {'label' in error &&
                !('html' in error) &&
                inspectorPane === 'footnotes' && (
                  <>
                    <div>Reference</div>
                    {error.label && <div>{error.label}</div>}
                  </>
                )}

              {'url' in error && inspectorPane === 'links' && (
                <>
                  <div>
                    <Tooltip label="Open URL in new window">
                      <a
                        href={error.url ?? ''}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                      >
                        {error.url}
                      </a>
                    </Tooltip>
                  </div>
                  <div>
                    {'html' in error && error.html && (
                      // eslint-disable-next-line react/no-danger
                      <div dangerouslySetInnerHTML={{ __html: error.html }} />
                    )}
                  </div>
                  {'title' in error && <div>{error.title}</div>}
                </>
              )}
              {(inspectorPane === 'lint' || inspectorPane === 'prose') && (
                <div>
                  {'url' in error && typeof error.url === 'string' ? (
                    <Tooltip label={error.url} placement="top">
                      <a
                        href={error.url}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                      >
                        {('source' in error && error.source) ||
                          ('ruleId' in error && error.ruleId)}
                      </a>
                    </Tooltip>
                  ) : (
                    <div>
                      {('source' in error && error.source) ||
                        ('ruleId' in error && error.ruleId)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  }

  const footnotes =
    entity &&
    entry &&
    property &&
    reports[entity]?.[entry]?.[property]?.footnotes;

  const isEntity = entity && !entry && !property;
  const hasAll = entity && entry && property;

  const tabs: Tabs = {};
  const reps = (entity &&
    entry &&
    property &&
    reports[entity]?.[entry]?.[property]) || {
    schema: [],
    lint: [],
    prose: [],
  };

  tabs.schema = {
    title: `Schema ${reps.schema?.length ? `(${reps.schema.length})` : ''}`,
  };

  if (isEntity) {
    tabs.entries = {
      // title: `Schema ${reps?.schema?.length ? `(${reps?.schema?.length})` : ''}`,
      title: `Entries`,
    };
  }

  if (language === 'markdown' && entity && entry && property) {
    tabs.lint = {
      title: `Lint ${reps.lint?.length ? `(${reps.lint.length})` : ''}`,
    };
    tabs.prose = {
      title: `Prose ${reps.prose?.length ? `(${reps.prose.length})` : ''}`,
    };
    tabs.links = {
      title: `Links ${
        reports[entity]?.[entry]?.[property]?.links?.length
          ? `(${String(reports[entity]?.[entry]?.[property]?.links?.length)})`
          : ''
      }`,
    };

    let allFootNotesLength = 0;
    if (footnotes) {
      allFootNotesLength =
        footnotes.references.length + footnotes.definitions.length;
    }
    tabs.footnotes = {
      title: `Foot notes ${
        allFootNotesLength > 0 ? `(${allFootNotesLength})` : ''
      }`,
    };
  }

  return (
    <div className="inspector-pane">
      {/* Inspector */}
      <TabBar
        tabs={tabs}
        switchPane={setInspectorPane}
        currentTab={inspectorPane}
        defaultTab="schema"
      />
      {inspectorPane === 'schema' && (
        <div>
          <ErrorPane reps={reps.schema} />
        </div>
      )}
      {/* <pre>
        <code>{JSON.stringify(reps.schema, null, 2)}</code>
      </pre> */}
      {entity && entry && property && content[entity]?.[entry]?.[property] && (
        <>
          {/* <div className="panes"> */}
          {hasAll && inspectorPane === 'lint' && (
            <div>
              <ErrorPane reps={reps.lint} />
            </div>
          )}
          {hasAll && inspectorPane === 'prose' && (
            <div>
              <ErrorPane reps={reps.prose} />
            </div>
          )}
          {hasAll && inspectorPane === 'links' && (
            <div>
              <ErrorPane reps={reps.links} />
            </div>
          )}
          {hasAll && inspectorPane === 'footnotes' && (
            <div>
              <ErrorPane
                reps={[
                  ...(reps.footnotes?.references ?? []),
                  ...(reps.footnotes?.definitions ?? []),
                ]}
              />
            </div>
          )}
          {/* </div> */}
        </>
      )}
      {isEntity && (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {inspectorPane === 'entries' && (
            <div>
              {/* Entries… */}
              {/* <ErrorPane reps={content[entity][entry][property].references} /> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
