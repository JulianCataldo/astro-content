import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import cx from 'classnames';
/* ·········································································· */
import Headings from './Headings';
import ModalPopover from './ModalPopover';
/* ·········································································· */
import './Toolbar.scss';
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Entity() {
  const { content, schemas, config } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );

  const setRoute = useAppStore((state) => state.setRoute);
  const save = useAppStore((state) => state.save);

  const value = content?.[entity]?.[entry]?.[property];
  const isMd = value?.headings && value?.rawMd;

  const copy = async (e) => {
    await navigator.clipboard.writeText(e.target.innerText);
    const prev = e.target.innerText;
    e.target.innerText = 'Copied!';
    setTimeout(() => {
      e.target.innerText = prev;
    }, 1500);
    console.log();
  };

  return (
    <div className="component-toolbar">
      <div className="actions">
        <ModalPopover
          render={({ close, labelId, descriptionId }) => (
            <>
              {/* <div>
                <p id={descriptionId}>Keep the name short!</p>
                <input placeholder="Name" autoFocus />
                <button onClick={close}>Create</button>
              </div> */}
              <h3 id={labelId}>From command line</h3>

              <h4>Define a new collection</h4>
              <pre>
                <span className="prefix">&gt; </span>
                <code onClick={copy}>pnpm content add people person</code>
              </pre>
              {/*
              <h4>New singleton</h4>
              <pre>
                <code>&gt; pnpm content add contact-page</code>
              </pre>
              */}

              <h4>-or- for an existing collection</h4>
              <h5>Add an entry</h5>
              <pre>
                <span className="prefix">&gt; </span>
                <code onClick={copy}>pnpm content add people jane</code>
              </pre>

              <h5>Add an entry with a random name</h5>
              <pre>
                <span className="prefix">&gt; </span>
                <code onClick={copy}>pnpm content add people</code>
              </pre>
            </>
          )}
        >
          <div className="action" data-tooltip-placement="bottom">
            <Icon icon="system-uicons:create" width="2em" />
            Create
          </div>
        </ModalPopover>
      </div>

      <div className="actions file">
        {entity && (
          <div className="action" onClick={save}>
            <Icon icon="system-uicons:floppy" width="2em" /> Save
          </div>
        )}

        <div className="breadcrumb">
          {entity && schemas && schemas.content && schemas.content[entity] && (
            <div
              onClick={(e) => setRoute(entity, false, false)}
              className={cx('entity-link', entry && 'action')}
            >
              <Icon icon="system-uicons:location" width="2em" />
              {sentenceCase(schemas.content[entity].title)}
            </div>
          )}
          {entity && !entry && (
            <div>
              <Icon icon="system-uicons:chevron-right" width="2em" />
              Schema
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
        </div>
      </div>

      {content?.[entity]?.[entry]?.[property] && (
        <div className="actions">
          {content[entity][entry][property].headings &&
            content[entity][entry][property].rawMd && (
              <div className="headings">
                <ModalPopover
                  render={({ close, labelId, descriptionId }) => (
                    <div className="headings-details">
                      <Headings
                        items={content[entity][entry][property]?.headings}
                      />
                    </div>
                  )}
                >
                  <div className="action">
                    <Icon
                      icon="system-uicons:document-list"
                      width="2em"
                      height="2.5em"
                    />
                    Headings
                  </div>
                </ModalPopover>
              </div>
            )}

          <a
            target="content-maestro-preview"
            href={config?.previewUrl}
            className="action"
          >
            <Icon icon="simple-icons:astro" width="2em" height="1.5em" />
            Preview
          </a>

          <div className="action">
            <Icon icon="system-uicons:info-circle" width="2em" height="1.5em" />
            Infos
          </div>
        </div>
      )}
    </div>
  );
}
