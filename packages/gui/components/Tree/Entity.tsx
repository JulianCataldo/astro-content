import yaml from 'yaml';
import { sentenceCase } from 'change-case';
import cx from 'classnames';
import { Icon } from '@iconify/react';
/* ·········································································· */
import type { Content, Schemas } from '@astro-content/types/server-state';
import Tooltip from '../Tooltip';
import useAppStore from '../../store';
import Property from './Property';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Entity({ content }: { content: Content }) {
  const { schemas } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const setRoute = useAppStore((state) => state.ui_setRoute);

  const entityLabel = (key: keyof Schemas['content']) =>
    entity
      ? `<strong>Schema</strong><hr>${yaml
          .stringify(schemas.content[key])
          .substring(0, 150)}…`
      : '';

  return (
    <>
      {Object.entries(content).map(([entityKey, entityTree]) => (
        <div key={entityKey} className="leaf entity">
          <Tooltip label={entityLabel(entityKey)} placement="right">
            {/* FIXME: JSX A11y */}
            {/*  eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
              // href={`/${key}`}
              onClick={() => setRoute(entityKey, false, false)}
              className={cx(
                'entity-link route',
                entity === entityKey && 'active',
              )}
            >
              <div className="folder">
                <Icon icon="system-uicons:chevron-down" />
              </div>
              <span className="tree-label">{sentenceCase(entityKey)}</span>
              <span className="spacer" />
              {/* <span onClick={() => createEntity(key)} className="trigger">
                <Icon icon="system-uicons:create" width="1em" />
              </span> */}
            </div>
          </Tooltip>
          {entityTree &&
            Object.entries(entityTree).map(([entryKey, entryTree]) => (
              <div key={entryKey} className="leaf child entry">
                {/* FIXME: JSX A11y */}
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                  onClick={() =>
                    setRoute(entityKey, property ? entryKey : entry, property)
                  }
                  className={cx(
                    'route entry-link',
                    entity === entityKey && entry === entryKey && 'active',
                  )}
                  // href={`/${key}/${eKey}`}
                >
                  <div className="folder">
                    <Icon icon="system-uicons:chevron-down" />
                  </div>
                  <span className="tree-label">{sentenceCase(entryKey)}</span>
                </div>
                {entryTree && (
                  <Property
                    content={content}
                    entryTree={entryTree}
                    entityKey={entityKey}
                    entryKey={entryKey}
                  />
                )}
              </div>
            ))}
        </div>
      ))}
    </>
  );
}
