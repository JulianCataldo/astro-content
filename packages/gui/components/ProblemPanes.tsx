import type { Position } from 'unist';
import type { Reports } from '@astro-content/types/reports';
/* ·········································································· */
import Tooltip from './Tooltip';
import { Icon } from '@iconify/react';
import useAppStore from '../store';
import { log } from '../logger';
/* —————————————————————————————————————————————————————————————————————————— */

export default function ProblemPanes({
  problems = [],
}: {
  problems: Reports | undefined;
}) {
  const inspectorPane = useAppStore((state) => state.ui_inspectorPane);
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
