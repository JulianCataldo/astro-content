import { useEffect, useState } from 'react';
import Split from 'react-split';
import {
  Link,
  MakeGenerics,
  Outlet,
  ReactLocation,
  Router,
  useMatch,
} from '@tanstack/react-location';
/* ·········································································· */
import { useKeyBoardShortcuts } from './use-keyboard-shortcuts';
import Tree from '../Tree/Tree';
import File from '../File';
import Assistant from '../Assistant';
import Inspector from '../Inspector';
import State from '../State';
import Toolbar from '../Toolbar';
import CopyInlineCode from '../CopyInlineCode';
// import './App.scss';
/* ·········································································· */
import { useAppStore } from '../../store';
// import { log } from '../../logger';
// import CommandPalette from './Modal';
/* —————————————————————————————————————————————————————————————————————————— */

const location = new ReactLocation();

interface Props {
  isValidContentBase: boolean;
  children: JSX.Element;
}
export default function Gui({ isValidContentBase, children }: Props) {
  const { entity, entry, property } = useAppStore((state) => state.ui_route);

  useKeyBoardShortcuts();

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    /* For client-only stuffs (`SplitPane` for ex.) */
    setDidMount(true);

    // HACK: For ssr-entrypoint first load
    // @ts-ignore
    window.loaded = true;
  });

  return (
    <Router location={location} routes={[{ path: '/' }]}>
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
        {isValidContentBase && didMount ? (
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
            <br />
            You might need to reload the page.
            {children}
          </div>
        )}
      </div>
    </Router>
  );
}
