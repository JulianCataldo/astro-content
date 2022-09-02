/* eslint-disable max-lines */
import yaml from 'yaml';
import { sentenceCase } from 'change-case';
import cx from 'classnames';
import { useEffect, useState } from 'react';
/* ·········································································· */
import { Icon } from '@iconify/react';
import type { Part } from '@astro-content/types/gui-state';
import type { ServerState } from '@astro-content/types/server-state';
import Tooltip from './Tooltip';
/* ·········································································· */
import './Tree.scss';
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Tree() {
  const { content, errors } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );
  const setRoute = useAppStore((state) => state.setRoute);
  const setInspectorPane = useAppStore((state) => state.setInspectorPane);

  const [searchInput, setSearchInput] = useState('');
  const [filteredContent, setFilteredContent] = useState({});

  // eslint-disable-next-line react/no-unstable-nested-components
  function MiniReport({
    errors: errs,
    type,
    title,
    route,
  }: {
    errors: { [key: string]: string | unknown }[];
    type: string;
    title: string;
    route: [Part, Part, Part];
  }) {
    return (
      errs.length > 0 && (
        <Tooltip
          label={`<strong>${title}</strong> (${errs.length}):${Array(
            errs.length,
          )
            .fill(0)
            .map(
              (val, index) =>
                `<br/><br/>- ${
                  errs[index]?.message || JSON.stringify(errs[index])
                }`,
            )
            .join('')}`}
          placement="right"
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <span
            className={`error errors-${type}`}
            onClick={(e) => {
              setInspectorPane(type);
              setRoute(...route);
            }}
          >
            <span>
              {title.charAt(0)}:&nbsp;<strong>{errs?.length}</strong>
            </span>
          </span>
        </Tooltip>
      )
    );
  }

  useEffect(() => {
    const filtered: ServerState['content'] = {};
    if (content) {
      Object.entries(content).forEach(([eKey, eVal]) => {
        if (filtered[eKey] === undefined) {
          filtered[eKey] = {};
        }
        Object.entries(eVal).forEach(([rKey, rVal]) => {
          if (rKey.toLowerCase().match(searchInput.toLowerCase())) {
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
      });
      setFilteredContent(filtered);
    }
    console.log('set', searchInput, content, filteredContent);
  }, [content, searchInput]);

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
      {content &&
        Object.entries(filteredContent).map(([key, entries]) => (
          <div key={key} className="leaf entity">
            <div
              // href={`/${key}`}
              onClick={(e) => setRoute(key, false, false)}
              className={cx('entity-link route', entity === key && 'active')}
            >
              <div className="folder">
                <Icon icon="system-uicons:chevron-down" />
              </div>
              <span className="tree-label">{sentenceCase(key)}</span>{' '}
              <span className="spacer" />
              {/* <span onClick={() => createEntity(key)} className="trigger">
                <Icon icon="system-uicons:create" width="1em" />
              </span> */}
            </div>

            {entries &&
              Object.entries(entries).map(([eKey, curEntry]) => (
                <div key={eKey} className="leaf child entry">
                  <div
                    // href={`/${key}/${eKey}`}
                    onClick={(e) =>
                      setRoute(key, property ? eKey : entry, property)
                    }
                    className={cx(
                      'route entry-link',
                      entity === key && entry === eKey && 'active',
                    )}
                  >
                    <div className="folder">
                      <Icon icon="system-uicons:chevron-down" />
                    </div>
                    <span className="tree-label">{sentenceCase(eKey)}</span>
                  </div>
                  {Object.entries(curEntry).map(([ppKey, parentProp]) => {
                    let errorsReport;
                    if (errors?.[key]?.[eKey]?.[ppKey]) {
                      errorsReport = errors[key][eKey][ppKey];
                    }

                    function toPretty({ data = null, literal = '' }) {
                      let convert = literal;
                      if (data) {
                        convert = yaml.stringify(data);
                      }
                      return `${convert
                        .replaceAll('\n', '<br />')
                        .substring(0, 350)}${convert.length > 350 ? '…' : ''}`;
                    }

                    const richText = toPretty({
                      literal: parentProp?.excerpt?.html || 'No excerpt\n',
                    });

                    let frontmatter = '';

                    if (
                      parentProp?.frontmatter &&
                      Object.entries(parentProp?.frontmatter).length
                    ) {
                      const literal = toPretty({
                        data: parentProp?.frontmatter,
                      });
                      frontmatter = `<p><strong>Frontmatter</strong><hr />${literal}</p><p><strong>`;

                      // }
                    }
                    // console.log({ parentProp });
                    const mdPreview = `${frontmatter}Excerpt</strong><hr />${richText}</p>`;

                    const fileLabel = parentProp?.frontmatter
                      ? mdPreview
                      : toPretty({ literal: parentProp.rawYaml });

                    const propActive =
                      entity === key && entry === eKey && property === ppKey;

                    const hasErrors =
                      (errorsReport?.schema?.length || 0) +
                      (errorsReport?.lint?.length || 0) +
                      (errorsReport?.prose?.length || 0);

                    return (
                      <div
                        // href={`/${key}/${eKey}/${ppKey}`}
                        key={ppKey}
                        className={cx(
                          'property-link leaf child route',
                          propActive && 'active',
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          setRoute(key, eKey, ppKey);
                        }}
                      >
                        <div className="file-title">
                          <Tooltip label={fileLabel} placement="right">
                            <span className="file-infos trigger">
                              <Icon
                                icon={
                                  parentProp.rawMd
                                    ? Object.entries(parentProp?.frontmatter)
                                        .length
                                      ? 'bi:circle-square'
                                      : 'bi:square-fill'
                                    : 'bi:circle-fill'
                                }
                                width="1.15rem"
                                height="1.15rem"
                                className={cx(
                                  parentProp?.headings && parentProp.rawMd
                                    ? 'icon-md'
                                    : 'icon-yaml',
                                )}
                              />
                            </span>
                          </Tooltip>

                          <span className="tree-label">
                            {sentenceCase(ppKey)}
                          </span>

                          <span className="spacer" />

                          {errorsReport && hasErrors > 0 && (
                            <div className={`${hasErrors ? 'errors' : ''}`}>
                              {/* &#9888;{' '} */}
                              {errorsReport?.schema?.length > 0 && (
                                <MiniReport
                                  errors={errorsReport?.schema}
                                  type="schema"
                                  title="Schema"
                                  route={[key, eKey, ppKey]}
                                />
                              )}
                              {errorsReport?.lint?.length > 0 && (
                                <MiniReport
                                  errors={errorsReport?.lint}
                                  type="lint"
                                  title="Linting"
                                  route={[key, eKey, ppKey]}
                                />
                              )}
                              {errorsReport?.prose?.length > 0 && (
                                <MiniReport
                                  errors={errorsReport?.prose}
                                  type="prose"
                                  title="Prose"
                                  route={[key, eKey, ppKey]}
                                />
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
