import yaml from 'yaml';
import cx from 'classnames';
import { sentenceCase } from 'change-case';
import { kebabCase } from 'lodash-es';
import { Link } from '@tanstack/react-location';
/* ·········································································· */
import { endpoints } from '@astro-content/server/state';
import type { Content } from '@astro-content/types/server-state';
import type { FileInstanceExtended } from '@astro-content/types/file';
import { Icon } from '@iconify/react';
import MiniReport from './MiniReport';
import Tooltip from '../Tooltip';
/* ·········································································· */
import { useAppStore } from '../../store';
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  entryTree: Record<string, FileInstanceExtended | undefined>;
  entityKey: string;
  entryKey: string;
  content: Content;
}
export default function Property({
  entryTree,
  entityKey,
  entryKey,
  content,
}: Props) {
  const { entity, entry, property } = useAppStore((state) => state.ui_route);

  return (
    <>
      {Object.entries(entryTree).map(([propKey, propTree]) => {
        const realPath = content[entityKey]?.[entryKey]?.[propKey]?.file;
        // REFACTOR: To JSX
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
          return `${convert.replaceAll('\n', '<br />').substring(0, 350)}${
            convert.length > 350 ? '…' : ''
          }`;
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
            : propTree?.language === 'yaml' &&
              toPretty({ literal: propTree.raw });

        const fileInfo = `${realPath ?? ''}<hr />${
          filePreview || 'No preview'
        }`;

        const propActive =
          entity === entityKey && entry === entryKey && property === propKey;

        let icon;

        if (propTree) {
          if (propTree?.language === 'yaml') {
            icon = 'bi:circle-fill';
          } else {
            if (Object.entries(propTree.frontmatter).length) {
              icon = 'bi:circle-square';
            } else {
              icon = 'bi:square-fill';
            }
          }
        }

        return (
          <Link
            key={propKey}
            className={cx(
              'property-link leaf child route',
              propActive && 'active',
            )}
            // IDEA: Map route to history + location
            to={`${endpoints.contentBase}/${kebabCase(entityKey)}/${kebabCase(
              entryKey,
            )}/${kebabCase(propKey)}`}
          >
            <div className="file-title">
              <Tooltip label={fileInfo} placement="right">
                <span className="file-infos trigger">
                  <Icon
                    icon={icon ?? ''}
                    width="0.75rem"
                    height="0.75rem"
                    className={`icon-${propTree?.language}`}
                  />
                </span>
              </Tooltip>

              <div className="tree-label">
                <span>{sentenceCase(propKey)}</span>
              </div>

              <span className="spacer" />

              <MiniReport
                entityKey={entityKey}
                entryKey={entryKey}
                propKey={propKey}
              />
            </div>
          </Link>
        );
      })}
    </>
  );
}
