import Split from 'react-split';
import Tree from '../Tree/Tree';
import File from '../File';
import Assistant from '../Assistant';
import Inspector from '../Inspector';
// import CommandPalette from './Modal';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Gui({ hasNoRoute }: { hasNoRoute?: boolean }) {
  return (
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
              {hasNoRoute && (
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
  );
}

Gui.defaultProps = {
  hasNoRoute: false,
};
