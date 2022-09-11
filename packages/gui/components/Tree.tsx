/* eslint-disable max-lines */
import yaml from 'yaml';
import { sentenceCase } from 'change-case';
import cx from 'classnames';
import { useEffect, useState } from 'react';
/* ·········································································· */
import type { Part } from '@astro-content/types/gui-state';
import type { Schemas, ServerState } from '@astro-content/types/server-state';
import type { Reports } from '@astro-content/types/reports';
import { Icon } from '@iconify/react';
/* ·········································································· */
import Tooltip from './Tooltip';
import './Tree.scss';
import useAppStore from '../store';
import { log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

function MiniReport({
  errors: errs,
  type,
  title,
  route,
}: {
  errors: Reports;
  type: string;
  title: string;
  route: [Part, Part, Part];
}) {
  const setRoute = useAppStore((state) => state.ui_setRoute);
  const setInspectorPane = useAppStore((state) => state.ui_setInspectorPane);

  return (
    <Tooltip
      label={`<strong>${title}</strong> (${errs.length}):${errs
        .map(
          (val) =>
            `<br/><br/>- ${
              'message' in val ? val.message ?? '' : JSON.stringify(val)
            }`,
        )
        .join('')}`}
      placement="right"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <span
        className={`error errors-${type}`}
        onClick={() => {
          setInspectorPane(type);
          setRoute(...route);
        }}
      >
        <span>
          {title.charAt(0)}:&nbsp;<strong>{errs.length}</strong>
        </span>
      </span>
    </Tooltip>
  );
}

export default function Tree() {
  const {
    content,
    reports: errors,
    schemas,
  } = useAppStore((state) => state.data_server);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const setRoute = useAppStore((state) => state.ui_setRoute);

  const [searchInput, setSearchInput] = useState('');
  const [filteredContent, setFilteredContent] = useState<
    ServerState['content']
  >({});

  useEffect(() => {
    const filtered: ServerState['content'] = {};
    Object.entries(content).forEach(([eKey, eVal]) => {
      if (filtered[eKey] === undefined) {
        filtered[eKey] = {};
      }
      if (eVal) {
        Object.entries(eVal).forEach(([rKey, rVal]) => {
          if (rKey.toLowerCase().match(searchInput.toLowerCase())) {
            // FIXME: (possibly undefined)
            filtered[eKey][rKey] = rVal;
          } else {
            Object.entries(rVal).forEach(([pKey, pVal]) => {
              if (pKey.toLowerCase().match(searchInput.toLowerCase())) {
                filtered[eKey][rKey] = {};
                filtered[eKey][rKey][pKey] = pVal;
              }
            });
          }
        });
      }
    });
    setFilteredContent(filtered);
    log(['set', searchInput, content, filteredContent]);
  }, [content, searchInput]);

  const entityLabel = (key: keyof Schemas['content']) =>
    entity
      ? `<strong>Schema</strong><hr>${yaml
          .stringify(schemas.content[key])
          .substring(0, 150)}…`
      : '';

  return (
    <div className="component-tree">
      <div>
        <input
          type="search"
          name=""
          id=""
          placeholder="Search…"
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      {Object.entries(filteredContent).map(([entityKey, entityTree]) => (
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
                {entryTree &&
                  Object.entries(entryTree).map(([propKey, propTree]) => {
                    const errorsReport =
                      errors[entityKey]?.[entryKey]?.[propKey];

                    function toPretty({
                      data = null,
                      literal = '',
                    }: {
                      data?: unknown;
                      literal?: string;
                    }) {
                      let convert = literal;
                      if (data) {
                        convert = yaml.stringify(data);
                      }
                      return `${convert
                        .replaceAll('\n', '<br />')
                        .substring(0, 350)}${convert.length > 350 ? '…' : ''}`;
                    }

                    const richText =
                      propTree &&
                      'excerpt' in propTree &&
                      toPretty({
                        literal: propTree.excerpt?.html ?? 'No excerpt\n',
                      });

                    let frontmatter = '';

                    if (
                      propTree &&
                      'frontmatter' in propTree &&
                      Object.entries(propTree.frontmatter).length
                    ) {
                      const literal = toPretty({
                        data: propTree.frontmatter,
                      });
                      frontmatter = `<p><strong>Frontmatter</strong><hr />${literal}</p><p><strong>`;
                    }

                    const mdPreview = `${frontmatter}<strong>Excerpt</strong><hr />${
                      richText || ''
                    }</p>`;

                    const filePreview =
                      propTree && 'frontmatter' in propTree
                        ? mdPreview
                        : propTree &&
                          'rawYaml' in propTree &&
                          toPretty({ literal: propTree.rawYaml });

                    const propActive =
                      entity === entityKey &&
                      entry === entryKey &&
                      property === propKey;

                    const hasErrors =
                      (errorsReport?.schema?.length || 0) +
                      (errorsReport?.lint?.length || 0) +
                      (errorsReport?.prose?.length || 0);

                    let icon;

                    if (propTree) {
                      if ('rawMd' in propTree) {
                        if (Object.entries(propTree.frontmatter).length) {
                          icon = 'bi:circle-square';
                        } else {
                          icon = 'bi:square-fill';
                        }
                      } else {
                        icon = 'bi:circle-fill';
                      }
                    }

                    return (
                      // FIXME: JSX A11y
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                      <div
                        key={propKey}
                        className={cx(
                          'property-link leaf child route',
                          propActive && 'active',
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          setRoute(entityKey, entryKey, propKey);
                        }}
                        // href={`/${key}/${eKey}/${ppKey}`}
                      >
                        <div className="file-title">
                          <Tooltip
                            label={
                              filePreview ? `${filePreview}` : 'No preview'
                            }
                            placement="right"
                          >
                            <span className="file-infos trigger">
                              <Icon
                                icon={icon ?? ''}
                                width="1.15rem"
                                height="1.15rem"
                                className={cx(
                                  propTree && 'headingsCompiled' in propTree
                                    ? 'icon-md'
                                    : 'icon-yaml',
                                )}
                              />
                            </span>
                          </Tooltip>

                          <span className="tree-label">
                            {sentenceCase(propKey)}
                          </span>

                          <span className="spacer" />

                          {errorsReport && hasErrors > 0 && (
                            <div className={`${hasErrors ? 'errors' : ''}`}>
                              {/* &#9888;{' '} */}
                              {'schema' in errorsReport &&
                              errorsReport.schema?.length &&
                              errorsReport.schema.length > 0 ? (
                                <MiniReport
                                  errors={errorsReport.schema}
                                  type="schema"
                                  title="Schema"
                                  route={[entityKey, entryKey, propKey]}
                                />
                              ) : (
                                ''
                              )}
                              {'lint' in errorsReport &&
                              errorsReport.lint?.length &&
                              errorsReport.lint.length > 0 ? (
                                <MiniReport
                                  errors={errorsReport.lint}
                                  type="lint"
                                  title="Linting"
                                  route={[entityKey, entryKey, propKey]}
                                />
                              ) : (
                                ''
                              )}
                              {'prose' in errorsReport &&
                              errorsReport.prose?.length &&
                              errorsReport.prose.length > 0 ? (
                                <MiniReport
                                  errors={errorsReport.prose}
                                  type="prose"
                                  title="Prose"
                                  route={[entityKey, entryKey, propKey]}
                                />
                              ) : (
                                ''
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
