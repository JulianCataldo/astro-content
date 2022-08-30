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
  const { entity, entry, property } = useAppStore((state) => state.route);

  const setRoute = useAppStore((state) => state.setRoute);
  const save = useAppStore((state) => state.save);

  return (
    <div className="component-toolbar">
      <div className="actions">
        <ModalPopover
          render={({ close, labelId, descriptionId }) => (
            <>
              <div>
                <h3 id={labelId}>Create new app</h3>
                <p id={descriptionId}>Keep the name short!</p>
                <input placeholder="Name" autoFocus />
                <button onClick={close}>Create</button>
              </div>
              <code>&gt; $ maestro create entity entry</code>
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
        <div className="action" onClick={save}>
          <Icon icon="system-uicons:floppy" width="2em" /> Save
        </div>
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
            <div>
              <Icon icon="system-uicons:chevron-right" width="2em" />
              {sentenceCase(property)}
            </div>
          )}
        </div>
      </div>

      {content?.[entity]?.[entry]?.[property] && (
        <div className="actions">
          <a
            target="content-maestro-preview"
            href={config?.previewUrl}
            className="action"
          >
            <Icon icon="simple-icons:astro" width="2em" height="1.5em" />
            Preview
          </a>

          <div className="action">
            <Icon icon="system-uicons:info-circle" width="2em" />
            Infos
          </div>

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
                <Icon icon="system-uicons:document-list" width="2em" />
                Headings
              </div>
            </ModalPopover>
          </div>
        </div>
      )}
    </div>
  );
}
