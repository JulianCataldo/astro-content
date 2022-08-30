import yaml from 'yaml';
import { sentenceCase } from 'change-case';
import cx from 'classnames';
/* ·········································································· */
import { Icon } from '@iconify/react';
import Tooltip from './Tooltip';
/* ·········································································· */
import './Tree.scss';
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Tree() {
  const { content, errors } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore((state) => state.route);
  const setRoute = useAppStore((state) => state.setRoute);

  const MiniReport = ({ errors, type, title }) => {
    return errors.length ? (
      <Tooltip
        label={`<strong>${title}</strong> errors (${
          errors.length
        }):<br/><br/>${yaml.stringify(errors[0]).replaceAll('\n', '<br />')}`}
        placement="top"
      >
        <span className={`error errors-${type}`}>
          {title.charAt(0)}:&nbsp;<strong>{errors?.length}</strong>
        </span>
      </Tooltip>
    ) : (
      <span className={`error errors-${type}`}>
        {title.charAt(0)}&nbsp;: <strong>{errors?.length}</strong>
      </span>
    );
  };

  return (
    <div className="component-tree">
      {content &&
        Object.entries(content).map(([key, entries]) => (
          <div key={key} className="leaf entity">
            <div
              href={`/${key}`}
              onClick={(e) => setRoute(key, false, false)}
              className={cx('entity-link route', entity === key && 'active')}
            >
              <Icon icon="system-uicons:chevron-down" className="folder" />
              <span className="tree-label">{sentenceCase(key)}</span>{' '}
              <span className="spacer" />
              <span onClick={() => createEntity(key)} className="trigger">
                <Icon icon="system-uicons:create" width="1em" />
              </span>
            </div>

            {Object.entries(entries).map(([eKey, curEntry]) => (
              <div key={eKey} className="leaf child entry">
                <div
                  href={`/${key}/${eKey}`}
                  onClick={(e) => setRoute(key, eKey, property)}
                  className={cx(
                    'route entry-link',
                    entity === key && entry === eKey && 'active',
                  )}
                >
                  <Icon icon="system-uicons:chevron-down" className="folder" />
                  <span className="tree-label">{sentenceCase(eKey)}</span>
                </div>
                {Object.entries(curEntry).map(([ppKey, parentProp]) => {
                  let errorsReport;
                  if (errors?.[key]?.[eKey]?.[ppKey]) {
                    errorsReport = errors[key][eKey][ppKey];
                  }

                  const fileLabel =
                    parentProp?.excerpt?.html?.replaceAll('\n', '<br />') ||
                    `${parentProp.rawYaml
                      ?.replaceAll('\n', '<br />')
                      ?.substring(0, 50)}…`;

                  const propActive =
                    entity === key && entry === eKey && property === ppKey;

                  const hasErrors =
                    (errorsReport?.schema?.length || 0) +
                    (errorsReport?.lint?.length || 0) +
                    (errorsReport?.prose?.length || 0);

                  return (
                    <a
                      key={ppKey}
                      className={cx(
                        'property-link leaf child route',
                        propActive && 'active',
                      )}
                      href={`/${key}/${eKey}/${ppKey}`}
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
                                parentProp?.headings &&
                                Object.entries(parentProp?.frontmatter).length >
                                  0 &&
                                parentProp.rawMd
                                  ? 'system-uicons:circle-split'
                                  : 'system-uicons:circle'
                              }
                              width="1rem"
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

                        {hasErrors > 0 && (
                          <div className={`${hasErrors ? 'errors' : ''}`}>
                            {/* &#9888;{' '} */}
                            {errorsReport?.schema?.length > 0 && (
                              <MiniReport
                                errors={errorsReport?.schema}
                                type="schema"
                                title="Schema"
                              />
                            )}
                            {errorsReport?.lint?.length > 0 && (
                              <MiniReport
                                errors={errorsReport?.lint}
                                type="lint"
                                title="Linting"
                              />
                            )}
                            {errorsReport?.prose?.length > 0 && (
                              <MiniReport
                                errors={errorsReport?.prose}
                                type="prose"
                                title="Prose"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
