/* eslint-disable max-lines */
import type { Position } from 'unist';
import { Icon } from '@iconify/react';
import type { Reports } from '@astro-content/types/reports';
/* ·········································································· */
import useAppStore from '../store';
import TabBar, { Tabs } from './TabBar';
import Tooltip from './Tooltip';
import { log } from '../logger';
// import './Inspector.scss';
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
  function ProblemPane({ problems = [] }: { problems: Reports | undefined }) {
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
        {Array.isArray(problems) &&
          problems.map((problem, key) => (
            // FIXME: JSX Ally
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              // FIXME: Proper unique key
              // eslint-disable-next-line react/no-array-index-key
              key={key}
              className={`row ${problem.position?.start.line ? 'jumper' : ''}`}
              onClick={() =>
                problem.position ? jumpToCode(problem.position) : null
              }
            >
              {problem.position?.start.line ? (
                <div>
                  <Icon
                    icon="system-uicons:arrow-top-right"
                    width="1em"
                    height="1em"
                  />
                </div>
              ) : (
                <div>&nbsp;</div>
              )}

              {inspectorPane === 'schema' && 'schemaPath' in problem && (
                <>
                  {typeof problem.schemaPath === 'string' && (
                    <div>{problem.schemaPath}</div>
                  )}
                  {typeof problem.keyword === 'string' && (
                    <div>{problem.keyword}</div>
                  )}
                  {typeof problem.params === 'object' &&
                  typeof problem.params.missingProperty === 'string' ? (
                    <div>{problem.params.missingProperty}</div>
                  ) : (
                    <div></div>
                  )}
                </>
              )}

              {'message' in problem && <div>{problem.message}</div>}
              {'note' in problem && <div>{problem.note}</div>}

              {'html' in problem &&
                'label' in problem &&
                inspectorPane === 'footnotes' && (
                  <>
                    <div>Definition</div>
                    {problem.label && <div>{problem.label}</div>}
                    {problem.html && (
                      // eslint-disable-next-line react/no-danger
                      <div dangerouslySetInnerHTML={{ __html: problem.html }} />
                    )}
                  </>
                )}
              {'label' in problem &&
                !('html' in problem) &&
                inspectorPane === 'footnotes' && (
                  <>
                    <div>Reference</div>
                    {problem.label && <div>{problem.label}</div>}
                  </>
                )}

              {'url' in problem && inspectorPane === 'links' && (
                <>
                  <div>
                    <Tooltip label="Open URL in new window">
                      <a
                        href={problem.url ?? ''}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                      >
                        {problem.url}
                      </a>
                    </Tooltip>
                  </div>
                  <div>
                    {'html' in problem && problem.html && (
                      // eslint-disable-next-line react/no-danger
                      <div dangerouslySetInnerHTML={{ __html: problem.html }} />
                    )}
                  </div>
                  {'title' in problem && <div>{problem.title}</div>}
                </>
              )}
              {(inspectorPane === 'lint' || inspectorPane === 'prose') && (
                <div>
                  {'url' in problem && typeof problem.url === 'string' ? (
                    <Tooltip label={problem.url} placement="top">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                      >
                        {('source' in problem && problem.source) ||
                          ('ruleId' in problem && problem.ruleId)}
                      </a>
                    </Tooltip>
                  ) : (
                    <div>
                      {('source' in problem && problem.source) ||
                        ('ruleId' in problem && problem.ruleId)}
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
  const problems = (entity &&
    entry &&
    property &&
    reports[entity]?.[entry]?.[property]) || {
    schema: [],
    lint: [],
    prose: [],
  };

  tabs.schema = {
    title: `Schema ${
      problems.schema?.length ? `(${problems.schema.length})` : ''
    }`,
  };

  if (isEntity) {
    tabs.entries = {
      // title: `Schema ${reps?.schema?.length ? `(${reps?.schema?.length})` : ''}`,
      title: `Entries`,
    };
  }

  if (language === 'markdown' && entity && entry && property) {
    tabs.lint = {
      title: `Lint ${problems.lint?.length ? `(${problems.lint.length})` : ''}`,
    };
    tabs.prose = {
      title: `Prose ${
        problems.prose?.length ? `(${problems.prose.length})` : ''
      }`,
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
      <div className="reports">
        {inspectorPane === 'schema' && (
          <div>
            <ProblemPane problems={problems.schema} />
          </div>
        )}
        {/* <pre>
        <code>{JSON.stringify(problems.schema, null, 2)}</code>
      </pre> */}
        {entity && entry && property && content[entity]?.[entry]?.[property] && (
          <>
            {hasAll && inspectorPane === 'lint' && (
              <div>
                <ProblemPane problems={problems.lint} />
              </div>
            )}
            {hasAll && inspectorPane === 'prose' && (
              <div>
                <ProblemPane problems={problems.prose} />
              </div>
            )}
            {hasAll && inspectorPane === 'links' && (
              <div>
                <ProblemPane problems={problems.links} />
              </div>
            )}
            {hasAll && inspectorPane === 'footnotes' && (
              <div>
                <ProblemPane
                  problems={[
                    ...(problems.footnotes?.references ?? []),
                    ...(problems.footnotes?.definitions ?? []),
                  ]}
                />
              </div>
            )}
          </>
        )}
      </div>
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
