import { useEffect, useState } from 'react';
/* ·········································································· */
import type { ServerState } from '@astro-content/types/server-state';
/* ·········································································· */
import Entity from './Entity';
import './Tree.scss';
/* ·········································································· */
import useAppStore from '../../store';
import { log } from '../../logger';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Tree() {
  const { content } = useAppStore((state) => state.data_server);

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

  return (
    <div className="component-tree">
      <div>
        <input
          type="search"
          placeholder="Search…"
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <Entity content={filteredContent} />
    </div>
  );
}
