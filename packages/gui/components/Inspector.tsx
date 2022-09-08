/* eslint-disable max-lines */
import type { Position } from 'unist';
import { Icon } from '@iconify/react';
import type { Reports } from '@astro-content/types/server-state';
/* ·········································································· */
import useAppStore from '../store';
import TabBar, { Tabs } from './TabBar';
import Tooltip from './Tooltip';
import { log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Inspector() {
  const { content, errors } = useAppStore((state) => state.data);
  const inspectorPane = useAppStore((state) => state.uiState.inspectorPane);
  const language = useAppStore((state) => state.uiState.language);
  const setInspectorPane = useAppStore((state) => state.setInspectorPane);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );

  const defaultEditor = useAppStore((state) => state.defaultEditor);

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
  function ErrorPane({ errs }: { errs: Reports }) {
    return (
      <div className="errors-pane">
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

          {inspectorPane === 'footnotes' && 'definitions' in errs && (
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
            </>
          )}
        </div>
        {Array.isArray(errs) &&
          errs.map((error, key) => (
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
                  <div>{error.url}</div>
                  <div>
                    {'html' in error && error.html && (
                      // eslint-disable-next-line react/no-danger
                      <div dangerouslySetInnerHTML={{ __html: error.html }} />
                    )}
                  </div>
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
    errors[entity]?.[entry]?.[property]?.footnotes;

  const isEntity = entity && !entry && !property;
  const hasAll = entity && entry && property;

  const tabs: Tabs = {};
  const errs = (entity &&
    entry &&
    property &&
    errors[entity]?.[entry]?.[property]) || {
    schema: [],
    lint: [],
    prose: [],
  };

  tabs.schema = {
    title: `Schema ${errs.schema?.length ? `(${errs.schema.length})` : ''}`,
  };

  if (isEntity) {
    tabs.entries = {
      // title: `Schema ${errs?.schema?.length ? `(${errs?.schema?.length})` : ''}`,
      title: `Entries`,
    };
  }

  if (language === 'markdown' && entity && entry && property) {
    tabs.lint = {
      title: `Lint ${errs.lint?.length ? `(${errs.lint.length})` : ''}`,
    };
    tabs.prose = {
      title: `Prose ${errs.prose?.length ? `(${errs.prose.length})` : ''}`,
    };
    tabs.links = {
      title: `Links ${
        errors[entity]?.[entry]?.[property]?.links?.length
          ? `(${String(errors[entity]?.[entry]?.[property]?.links?.length)})`
          : ''
      }`,
    };

    const allFootNotesLength =
      // FIXME:
      footnotes?.references?.length + footnotes?.definitions?.length;
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
      {inspectorPane === 'schema' && errs.schema?.length && (
        <div>
          <ErrorPane errs={errs.schema} />
        </div>
      )}
      {entity &&
        entry &&
        property &&
        content[entity]?.[entry]?.[property] !== undefined && (
          <>
            {/* <div className="panes"> */}
            {hasAll && inspectorPane === 'lint' && errs.lint?.length && (
              <div>
                <ErrorPane errs={errs.lint} />
              </div>
            )}
            {hasAll && inspectorPane === 'prose' && errs.prose?.length && (
              <div>
                <ErrorPane errs={errs.prose} />
              </div>
            )}
            {hasAll && inspectorPane === 'links' && errs.links?.length && (
              <div>
                <ErrorPane errs={errs.links} />
              </div>
            )}
            {hasAll &&
              inspectorPane === 'footnotes' &&
              (errs.footnotes?.references.length ||
                errs.footnotes?.definitions.length) && (
                <div>
                  <ErrorPane
                    errs={[
                      ...errs.footnotes.references,
                      ...errs.footnotes.definitions,
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
              {/* <ErrorPane errs={content[entity][entry][property].references} /> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
