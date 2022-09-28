/* ·········································································· */
import { useAppStore } from '../store';
import TabBar, { Tabs } from './TabBar';
import ProblemPanes from './ProblemPanes';
import { log } from '../logger';
// import EntriesTable from './EntriesTable';
// import './Inspector.scss';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Inspector() {
  const { content, reports } = useAppStore((state) => state.data_server);
  const inspectorPane = useAppStore((state) => state.ui_inspectorPane);
  const language = useAppStore((state) => state.editor_language);
  const setInspectorPane = useAppStore((state) => state.ui_setInspectorPane);
  const { entity, entry, property } = useAppStore((state) => state.ui_route);

  const footnotes =
    entity &&
    entry &&
    property &&
    reports[entity]?.[entry]?.[property]?.footnotes;

  const isEntity = entity && !entry && !property;
  const hasAll = entity && entry && property;

  const tabs: Tabs = {};
  const problems = (entity &&
    entry &&
    property &&
    reports[entity]?.[entry]?.[property]) || {
    schema: [],
    lint: [],
    prose: [],
  };

  tabs.schema = {
    title: `Schema ${
      problems.schema?.length ? `(${problems.schema.length})` : ''
    }`,
  };

  if (isEntity) {
    tabs.entries = {
      // title: `Schema ${reps?.schema?.length ? `(${reps?.schema?.length})` : ''}`,
      title: `Entries`,
    };
  }

  if (
    (language === 'markdown' || language === 'mdx') &&
    entity &&
    entry &&
    property
  ) {
    tabs.lint = {
      title: `Lint ${problems.lint?.length ? `(${problems.lint.length})` : ''}`,
    };
    tabs.prose = {
      title: `Prose ${
        problems.prose?.length ? `(${problems.prose.length})` : ''
      }`,
    };
    tabs.links = {
      title: `Links ${
        reports[entity]?.[entry]?.[property]?.links?.length
          ? `(${String(reports[entity]?.[entry]?.[property]?.links?.length)})`
          : ''
      }`,
    };

    let allFootNotesLength = 0;
    if (footnotes) {
      allFootNotesLength =
        footnotes.references.length + footnotes.definitions.length;
    }
    tabs.footnotes = {
      title: `Foot notes ${
        allFootNotesLength > 0 ? `(${allFootNotesLength})` : ''
      }`,
    };
  }

  return (
    <div className="inspector-pane">
      {/* Inspector */}
      <TabBar
        tabs={tabs}
        switchPane={setInspectorPane}
        currentTab={inspectorPane}
        defaultTab="schema"
      />
      <div className="reports">
        {inspectorPane === 'schema' && (
          <div>
            <ProblemPanes problems={problems.schema} />
          </div>
        )}
        {/* <pre>
        <code>{JSON.stringify(problems.schema, null, 2)}</code>
      </pre> */}
        {entity && entry && property && content[entity]?.[entry]?.[property] && (
          <>
            {hasAll && inspectorPane === 'lint' && (
              <div>
                <ProblemPanes problems={problems.lint} />
              </div>
            )}
            {hasAll && inspectorPane === 'prose' && (
              <div>
                <ProblemPanes problems={problems.prose} />
              </div>
            )}
            {hasAll && inspectorPane === 'links' && (
              <div>
                <ProblemPanes problems={problems.links} />
              </div>
            )}
            {hasAll && inspectorPane === 'footnotes' && (
              <div>
                <ProblemPanes
                  problems={[
                    ...(problems.footnotes?.references ?? []),
                    ...(problems.footnotes?.definitions ?? []),
                  ]}
                />
              </div>
            )}
          </>
        )}

        {isEntity && (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {inspectorPane === 'entries' && (
              <div>
                {/* <EntriesTable /> */}
                {/* Entries… */}
                {/* <ErrorPane reps={content[entity][entry][property].references} /> */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
