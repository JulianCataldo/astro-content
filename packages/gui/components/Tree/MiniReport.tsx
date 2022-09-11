import type { Part } from '@astro-content/types/gui-state';
import type { Reports } from '@astro-content/types/reports';
/* ·········································································· */
import Tooltip from '../Tooltip';
import useAppStore from '../../store';
/* —————————————————————————————————————————————————————————————————————————— */

export default function MiniReport({
  errors: errs,
  type,
  title,
  route,
}: {
  errors: Reports;
  type: string;
  title: string;
  route: [Part, Part, Part];
}) {
  const setRoute = useAppStore((state) => state.ui_setRoute);
  const setInspectorPane = useAppStore((state) => state.ui_setInspectorPane);

  return (
    <Tooltip
      label={`<strong>${title}</strong> (${errs.length}):${errs
        .map(
          (val) =>
            `<br/><br/>- ${
              'message' in val ? val.message ?? '' : JSON.stringify(val)
            }`,
        )
        .join('')}`}
      placement="right"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <span
        className={`error errors-${type}`}
        onClick={() => {
          setInspectorPane(type);
          setRoute(...route);
        }}
      >
        <span>
          {title.charAt(0)}:&nbsp;<strong>{errs.length}</strong>
        </span>
      </span>
    </Tooltip>
  );
}
