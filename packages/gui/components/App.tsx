import { useEffect, useState } from 'react';
import Split from 'react-split';
/* ·········································································· */
import Tree from './Tree/Tree';
import File from './File';
import Assistant from './Assistant';
import Inspector from './Inspector';
import State from './State';
import Toolbar from './Toolbar';
import CopyInlineCode from './CopyInlineCode';
// import './App.scss';
/* ·········································································· */
import useAppStore from '../store';
import { log } from '../logger';
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  isValidContentBase: boolean;
}
export default function Gui({ isValidContentBase, children }: Props) {
  const { entity, entry, property } = useAppStore((state) => state.ui_route);
  const save = useAppStore((state) => state.editor_save);

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    /* Save — Keyboard shortcut */
    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        save();
        log('Keyboard: Meta+S fired!');
      }
    });

    /* For client-only stuffs (`SplitPane` for ex.) */
    setDidMount(true);

    // HACK: For ssr-entrypoint first load
    // @ts-ignore
    window.loaded = true;
  });

  return (
    <div className="component-app">
      <State />

      <Toolbar />

      {!isValidContentBase && (
        <div className="message-no-database">
          <strong>No valid content base was found</strong>
          <hr />
          <p>Create a minimal one by running:</p>
          <CopyInlineCode text="pnpm content setup" />
        </div>
      )}

      {didMount ? (
        <main>
          <Split
            sizes={[15, 85]}
            direction="horizontal"
            className="split-h"
            gutterSize={9}
            // minSize={[200, 200]}
            minSize={[0, 0]}
          >
            {/* LEFT-SIDEBAR */}
            <Tree />

            {/* ···························································· */}
            {/* CURRENT FILE EDITOR */}
            <Split
              sizes={[70, 30]}
              direction="vertical"
              className="split-v"
              gutterSize={9}
              // minSize={[200, 200]}
              minSize={[0, 0]}
            >
              {/* SIDE BY SIDE */}
              <Split
                sizes={[50, 50]}
                direction="horizontal"
                className="split-h"
                gutterSize={9}
                // FIXME: Not working?
                // minSize={[500, 200]}
                minSize={[0, 0]}
              >
                {/* FILE EDITOR */}
                <div>
                  {!entity && !entry && !property && (
                    <div className="message-please-select-file">
                      ← Please select a schema (entity) or a property (file)…
                    </div>
                  )}
                  <File />
                </div>
                {/* ························································ */}
                {/* FILE ASSISTANT */}
                <div>
                  <Assistant />
                </div>
              </Split>

              {/* ·························································· */}
              {/* LOWER SIDE-BAR FILE INSPECTOR */}
              <div>
                <Inspector />
              </div>
            </Split>
          </Split>
        </main>
      ) : (
        <div className="message-loading-database">
          Loading content base…
          {children}
        </div>
      )}
    </div>
  );
}
