import { useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
/* ·········································································· */
import Tree from './Tree';
import File from './File';
import Assistant from './Assistant';
import Inspector from './Inspector';
import State from './State';
import Toolbar from './Toolbar';
/* ·········································································· */
import './Gui.scss';
import useAppStore from '../store';
import CopyInlineCode from './CopyInlineCode';
import { log } from '../utils';
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  isValidContentBase: boolean;
}
export default function Gui({ isValidContentBase }: Props) {
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const save = useAppStore((state) => state.editor_save);

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    /* Save — Keyboard shortcut */
    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        save();
      }
    });
    /* For client-only stuffs (`SplitPane` for ex.) */
    setDidMount(true);
  });

  return (
    <div className="component-gui">
      <State />

      <Toolbar />

      {didMount && (
        <main>
          {/* Types problem: https://github.com/tomkp/react-split-pane/pull/819/commits/4795430f4cb6cb9b07b7ba93018ce46dd20a1ca0 */}
          <SplitPane split="vertical" defaultSize={260} minSize={200}>
            {/* LEFT-SIDEBAR */}

            {!isValidContentBase && (
              <div className="message-no-database">
                <strong>No valid content base was found</strong>
                <hr />
                <p>Create a minimal one by running:</p>
                <CopyInlineCode text="pnpm content setup" />
              </div>
            )}
            <Tree />

            {/* @ts-expect-error `SplitPane` JSX typings buggy with React 18 */}
            <SplitPane split="horizontal" defaultSize="65%" minSize={200}>
              {/* DUAL-VIEW EDITOR */}
              {/* @ts-expect-error `SplitPane` JSX typings buggy with React 18 */}
              <SplitPane
                split="vertical"
                defaultSize="50%"
                minSize={200}
                onDragFinished={(s) => {
                  log({ dragged: s });
                }}
              >
                {!entity && !entry && !property && (
                  <div className="message-please-select-file">
                    ← Please select a schema (entity) or a property (file)…
                  </div>
                )}
                <File />
                <Assistant />
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
