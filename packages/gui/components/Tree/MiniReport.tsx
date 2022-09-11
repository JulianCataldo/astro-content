/* ·········································································· */
import Tooltip from '../Tooltip';
import useAppStore from '../../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function MiniReport({
  entityKey,
  entryKey,
  propKey,
}: {
  entityKey: string;
  entryKey: string;
  propKey: string;
}) {
  const setRoute = useAppStore((state) => state.ui_setRoute);
  const setInspectorPane = useAppStore((state) => state.ui_setInspectorPane);

  const { reports } = useAppStore((state) => state.data_server);
  const errorsReport = reports[entityKey]?.[entryKey]?.[propKey];

  const hasErrors =
    (errorsReport?.schema?.length ?? 0) +
    (errorsReport?.lint?.length ?? 0) +
    (errorsReport?.prose?.length ?? 0);

  return (
    <div>
      {errorsReport && hasErrors > 0 && (
        <div className={`${hasErrors ? 'errors' : ''}`}>
          {(
            [
              { title: 'Schema', reportType: 'schema' },
              { title: 'Linting', reportType: 'lint' },
              { title: 'Prose', reportType: 'prose' },
            ] as {
              title: string;
              reportType: 'schema' | 'lint' | 'prose';
            }[]
          ).map(({ title, reportType }) =>
            reportType in errorsReport && errorsReport[reportType]?.length ? (
              <Tooltip
                label={`<strong>${title}</strong> (${
                  errorsReport[reportType]?.length ?? ''
                }):${
                  errorsReport[reportType]
                    ?.map(
                      // TODO: Replace with JSX
                      (val) =>
                        `<br/><br/>- ${
                          'message' in val
                            ? val.message ?? ''
                            : JSON.stringify(val)
                        }`,
                    )
                    .join('') ?? ''
                }`}
                placement="right"
              >
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                <span
                  className={`error errors-${reportType}`}
                  onClick={() => {
                    setInspectorPane(reportType);
                    setRoute(entityKey, entryKey, propKey);
                  }}
                >
                  <span>
                    {title.charAt(0)}:&nbsp;
                    <strong>{errorsReport[reportType]?.length}</strong>
                  </span>
                </span>
              </Tooltip>
            ) : (
              ''
            ),
          )}
        </div>
      )}
    </div>
  );
}
