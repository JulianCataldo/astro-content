/* eslint-disable max-lines */
import { useState } from 'react';
import type { Position } from 'unist';
import { Icon } from '@iconify/react';
import type {
  ErrorsLint,
  ErrorsSchema,
} from '@astro-content/types/server-state';
/* ·········································································· */
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

import TabBar, { Tabs } from './TabBar';
import Tooltip from './Tooltip';

export default function Inspector() {
  const { content, errors } = useAppStore((state) => state.data);
  const inspectorPane = useAppStore((state) => state.uiState.inspectorPane);
  const setInspectorPane = useAppStore((state) => state.setInspectorPane);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );

  const defaultEditor = useAppStore((state) => state.defaultEditor);

  function jumpToCode(position: Position) {
    console.log({ position });
    if (position?.start?.line) {
      const editor = defaultEditor;

      if (editor) {
        editor.focus();
        // TODO: VS Code doesn't set the cursor but make an highlight
        const posConvert = {
          lineNumber: position.end.line || position.start.line,
          column:
            position.end.col || position.end.column || position.start.column,
        };
        editor.setPosition(posConvert);
        editor.revealPositionInCenterIfOutsideViewport(posConvert);
      }
    }
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function ErrorPane({ errs }: { errs: ErrorsSchema[] | ErrorsLint[] }) {
    return (
      <div className="errors-pane">
        <div className="row header">
          <div></div>
          {inspectorPane === 'schema' && errs && errs[0] && (
            <>
              {errs[0].schemaPath && <div>Location</div>}
              {errs[0].keyword && <div>Keyword</div>}
              {errs[0].params?.missingProperty && <div>Missing property</div>}
              {errs[0].message && <div>Message</div>}
              {errs[0].note && <div>Full message</div>}
            </>
          )}
          {inspectorPane === 'lint' && (
            <>
              <div>Source (rule)</div>
              <div>Url</div>
            </>
          )}
        </div>
        {Array.isArray(errs) &&
          errs.map((error, key) => (
            <div
              key={key}
              tabIndex="0"
              className={`row ${error?.position?.start?.line ? 'jumper' : ''}`}
              onClick={() => jumpToCode(error.position)}
            >
              {error?.position?.start?.line ? (
                <Icon
                  icon="system-uicons:arrow-top-right"
                  width="1em"
                  height="1em"
                />
              ) : (
                <div></div>
              )}
              {error && inspectorPane === 'schema' && (
                <>
                  {typeof error?.schemaPath === 'string' && (
                    <div>{error.schemaPath}</div>
                  )}
                  {typeof error.keyword === 'string' && (
                    <div>{error.keyword}</div>
                  )}
                  {typeof error?.params === 'object' &&
                    typeof error?.params?.missingProperty === 'string' && (
                      <div>{error.params?.missingProperty}</div>
                    )}
                </>
              )}
              {error?.message && typeof error.message === 'string' && (
                <div>{error?.message}</div>
              )}
              {error?.note && typeof error.note === 'string' && (
                <div>{error?.note}</div>
              )}
              {inspectorPane === 'lint' && (
                <div>
                  <Tooltip
                    label={typeof error.url === 'string' ? error.url : ''}
                    placement="top"
                  >
                    <a
                      href={typeof error.url === 'string' ? error.url : '/'}
                      target="_blank"
                      rel="noreferrer noopener nofollow"
                    >
                      {typeof error.source === 'string' && error.source}(
                      {typeof error.ruleId === 'string' && error.ruleId})
                    </a>
                  </Tooltip>
                </div>
              )}
            </div>
          ))}
      </div>
    );
  }

  const tabs: Tabs = {};
  const errs = errors?.[entity]?.[entry]?.[property];

  tabs.schema = {
    button: {
      title: `Schema ${
        errs?.schema?.length ? `(${errs?.schema?.length})` : ''
      }`,
    },
  };
  tabs.lint = {
    button: {
      title: `Lint ${errs?.lint?.length ? `(${errs?.lint?.length})` : ''}`,
    },
  };
  tabs.prose = {
    button: {
      title: `Prose ${errs?.prose?.length ? `(${errs?.prose?.length})` : ''}`,
    },
  };

  tabs.refs = { button: { title: 'References' } };
  tabs.footnotes = { button: { title: 'Foot notes' } };

  const hasAll = errors && entity && entry && property;

  return (
    <div className="inspector-pane">
      {/* Inspector */}
      {entity &&
        entry &&
        property &&
        content?.[entity]?.[entry]?.[property] !== undefined && (
          <>
            <TabBar
              tabs={tabs}
              switchPane={setInspectorPane}
              currentTab={inspectorPane}
            />
            {hasAll && inspectorPane === 'schema' && (
              <div>
                <ErrorPane errs={errs?.schema} />
              </div>
            )}
            {hasAll && inspectorPane === 'lint' && (
              <div>
                <ErrorPane errs={errs?.lint} />
              </div>
            )}
            {hasAll && inspectorPane === 'prose' && (
              <div>
                <ErrorPane errs={errs?.prose} />
              </div>
            )}
            {hasAll && inspectorPane === 'refs' && (
              <div>
                <div></div>
              </div>
            )}
            {hasAll && inspectorPane === 'footnotes' && (
              <div>
                <div></div>
              </div>
            )}
          </>
        )}
    </div>
  );
}
