// REFACTOR: Split in sub-components
/* eslint-disable max-lines */

import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import cx from 'classnames';
/* ·········································································· */
import Headings from './Headings';
import ModalPopover from './ModalPopover';
// import './Toolbar.scss';
import Tooltip from './Tooltip';
/* ·········································································· */
import useAppStore from '../store';
import CopyInlineCode from './CopyInlineCode';

/* —————————————————————————————————————————————————————————————————————————— */

export default function Toolbar() {
  const { content, schemas, config } = useAppStore(
    (state) => state.data_server,
  );
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const language = useAppStore((state) => state.editor_language);

  const setRoute = useAppStore((state) => state.ui_setRoute);
  const save = useAppStore((state) => state.editor_save);
  const savingState = useAppStore((state) => state.editor_savingState);

  const isMd = language === 'markdown';
  const fullPath =
    entity && entry && property && content[entity]?.[entry]?.[property]?.file;

  return (
    <div className="component-toolbar">
      <div className="actions">
        <ModalPopover
          render={({ close, labelId, descriptionId }) => (
            <>
              {/* 
              <div>
                <p id={descriptionId}>Keep the name short!</p>
                <input placeholder="Name" autoFocus />
                <button onClick={close}>Create</button>
              </div>
              */}
              <h3 id={labelId}>From command line</h3>

              <h4>Define a new collection</h4>

              <CopyInlineCode
                text="pnpm content add people person"
                placement="top-end"
              />

              {/*
                <h4>New singleton</h4>
                <code>&gt; pnpm content add contact-page</code>
              */}

              <h4>-or- for an existing collection</h4>
              <h5>Add an entry</h5>

              <CopyInlineCode
                text="pnpm content add people jane"
                placement="top-end"
              />

              <h5>Add an entry with a random name</h5>

              <CopyInlineCode
                text="pnpm content add people"
                placement="top-end"
              />
            </>
          )}
        >
          <div className="action">
            <Icon icon="system-uicons:create" width="2em" />
            <span className="label">Create</span>
          </div>
        </ModalPopover>
      </div>

      <div className="actions file">
        {entity && (
          // FIXME: JSX A11y
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
          <Tooltip
            label={
              import.meta.env.DEV ? (
                <span>
                  <code>Ctrl/Cmd</code> +{' '}
                  <strong>
                    <code>S</code>
                  </strong>
                </span>
              ) : (
                <span>Saving is disabled in demo mode</span>
              )
            }
            jsx
          >
            <div className="action save" onClick={save}>
              <Icon
                icon="system-uicons:floppy"
                width="2em"
                className={savingState === 'idle' ? 'visible' : ''}
              />
              <Icon
                icon="system-uicons:clock"
                width="2em"
                className={savingState === 'busy' ? 'visible' : ''}
              />
              <Icon
                icon="system-uicons:check"
                width="2em"
                className={savingState === 'success' ? 'visible' : ''}
              />
              <Icon
                icon="system-uicons:cross"
                width="2em"
                className={savingState === 'failure' ? 'visible' : ''}
              />
              <span className="label">Save</span>
            </div>
          </Tooltip>
        )}

        <div className="breadcrumb">
          {entity && (
            // FIXME: JSX A11y
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div
              onClick={() => setRoute(entity, false, false)}
              className={cx('entity-link', entry && 'action')}
            >
              <Icon icon="system-uicons:location" width="2em" />
              {typeof schemas.content[entity] === 'object' &&
                sentenceCase(schemas.content[entity].title ?? '')}
            </div>
          )}
          {entity && !entry && (
            <div>
              <Icon icon="system-uicons:chevron-right" width="2em" />
              <span className="label">Schema</span>
            </div>
          )}
          {entry && (
            <div>
              <Icon icon="system-uicons:chevron-right" width="2em" />
              {sentenceCase(entry)}
            </div>
          )}
          {property && (
            <div className={cx('chevron-property', isMd ? 'md' : 'yaml')}>
              <Icon icon="system-uicons:chevron-right" width="2em" />
              <span>{sentenceCase(property)}</span>
            </div>
          )}
          {/* ({language}) */}
        </div>
      </div>

      {entity &&
        entry &&
        property &&
        typeof content[entity]?.[entry]?.[property] === 'object' && (
          <div className="actions">
            {isMd && (
              <div className="headings">
                <ModalPopover
                  render={({ close, labelId, descriptionId }) => (
                    <div className="headings-details">
                      <Headings
                        // FIXME: Prop. does not exist
                        items={
                          // @ts-ignore
                          content[entity]?.[entry]?.[property]?.headingsCompiled
                        }
                      />
                    </div>
                  )}
                >
                  <div className="action">
                    <Icon
                      icon="system-uicons:document-list"
                      width="2em"
                      height="2em"
                    />
                    <span className="label">Headings</span>
                  </div>
                </ModalPopover>
              </div>
            )}

            <a
              target="content-maestro-preview"
              href={config.previewUrl}
              className="action"
            >
              <Icon icon="simple-icons:astro" width="2em" height="1.5em" />
              <span className="label">Preview</span>
            </a>

            <ModalPopover
              render={({ close, labelId, descriptionId }) => (
                <div className="infos-tooltip">
                  {/* {JSON.stringify(content[entity][entry][property])} */}
                  {fullPath && (
                    <div>
                      <strong>Current file</strong>: {fullPath}
                      <hr />
                    </div>
                  )}
                  <div>
                    <strong>Environment</strong>
                    {Object.entries(import.meta.env).map(([key, obj]) =>
                      obj && !['DEV', 'PROD'].includes(key) ? (
                        <div className="table" key={key}>
                          <span>
                            <strong>{key}</strong>:
                          </span>
                          <span> {JSON.stringify(obj)}</span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              )}
            >
              <div>
                <div className="action">
                  <Icon
                    icon="system-uicons:info-circle"
                    width="2em"
                    height="1.5em"
                  />
                  <span className="label">Infos</span>
                </div>
              </div>
            </ModalPopover>

            {fullPath && (
              <Tooltip
                label={<>Open in VS Code: {fullPath}</>}
                jsx
                placement="top"
              >
                <a className="action" href={`vscode://${fullPath}`}>
                  <Icon
                    icon="simple-icons:visualstudiocode"
                    width="2em"
                    height="1.5em"
                  />
                  <span className="label">IDE</span>
                </a>
              </Tooltip>
            )}
          </div>
        )}
    </div>
  );
}
