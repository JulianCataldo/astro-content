import { useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
/* ·········································································· */
import Tree from './Tree';
import File from './File';
import Preview from './Preview';
import Inspector from './Inspector';
import State from './State';
import Toolbar from './Toolbar';
/* ·········································································· */
import './Gui.scss';
import { useAppStore } from '../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Gui({ ssrContent }) {
  const save = useAppStore((state) => state.save);
  const { errors } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );
  const [didMount, setDidMount] = useState(false);

  /* Save — Keyboard shortcut */
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if ((e.key === 's' && e.metaKey) || e.ctrlKey) {
        e.preventDefault();
        save();
      }
    });
    setDidMount(true);
  });

  const prop = errors?.[entity]?.[entry]?.[property];

  return (
    <div className="component-gui">
      <State />

      <Toolbar />

      {didMount && (
        <main>
          <SplitPane split="vertical" defaultSize={260} minSize={200}>
            {/* LEFT-SIDEBAR */}

            <Tree />

            <SplitPane split="horizontal" defaultSize="65%" minSize={200}>
              {/* DUAL-VIEW EDITOR */}
              <SplitPane split="vertical" defaultSize="50%" minSize={200}>
                <File />

                <Preview />
              </SplitPane>
              {/* LOWER SIDE-BAR INSPECTOR */}
              <Inspector />
            </SplitPane>
          </SplitPane>
        </main>
      )}
    </div>
  );
}
