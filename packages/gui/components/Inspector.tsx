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

import TabBar from './TabBar';
import Tooltip from './Tooltip';

export default function Inspector() {
  const { content, errors } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore((state) => state.route);
  const [currentPane, setCurrentPane] = useState(0);

  const defaultEditor = useAppStore((state) => state.defaultEditor);

  function switchPane(index: number) {
    setCurrentPane(index);
  }
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
          {currentPane === 0 && (
            <>
              <div>Location</div>
              <div>Keyword</div>
              <div>Missing property</div>
            </>
          )}
          <div>Message</div>
          {currentPane === 1 && (
            <>
              <div>Source (rule)</div>
              <div>Url</div>
            </>
          )}
        </div>
        {Array.isArray(errs) &&
          errs.map((error) => (
            <div
              tabIndex="0"
              className={`row ${error?.position?.start?.line ? 'jumper' : ''}`}
              onClick={() => jumpToCode(error.position)}
            >
              {error?.position?.start?.line ? (
                <Icon icon="system-uicons:code" width="1em" height="1em" />
              ) : (
                <div></div>
              )}
              {error && currentPane === 0 && (
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
              {currentPane === 1 && (
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

  const tabs = [];
  const errs = errors?.[entity]?.[entry]?.[property];

  if (errs) {
    tabs.push({
      button: {
        title: `Schema ${
          errs?.schema?.length ? `(${errs?.schema?.length})` : ''
        }`,
      },
    });
    tabs.push({
      button: {
        title: `Lint ${errs?.lint?.length ? `(${errs?.lint?.length})` : ''}`,
      },
    });
    tabs.push({
      button: {
        title: `Prose ${errs?.prose?.length ? `(${errs?.prose?.length})` : ''}`,
      },
    });
  }
  tabs.push({ button: { title: 'References' } });

  return (
    <div className="inspector-pane">
      {/* Inspector */}
      {entity && entry && property && content?.[entity]?.[entry]?.[property] && (
        <>
          <TabBar
            tabs={tabs}
            switchPane={switchPane}
            currentTab={currentPane}
          />

          {errors && entity && entry && property && currentPane === 0 && (
            <div>
              <ErrorPane errs={errs?.schema} />
            </div>
          )}
          {errors && entity && entry && property && currentPane === 1 && (
            <div>
              <ErrorPane errs={errs?.lint} />
            </div>
          )}
          {errors && entity && entry && property && currentPane === 2 && (
            <div>
              <ErrorPane errs={errs?.prose} />
            </div>
          )}
          {errors && entity && entry && property && currentPane === 3 && (
            <div>
              <h3>References</h3>
              <div>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Dolores quaerat molestiae nostrum amet eaque odit cupiditate
                doloribus est, harum ex repellat earum quae autem, tenetur modi
                fuga velit impedit. Architecto.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
