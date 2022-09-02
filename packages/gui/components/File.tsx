/* —————————————————————————————————————————————————————————————————————————— */
import { useAppStore } from '../store';
/* ·········································································· */

import Editor from './Editor';

export default function Entity() {
  const { content, schemas } = useAppStore((state) => state.data);
  const { entity, entry, property } = useAppStore(
    (state) => state.uiState.route,
  );

  const isMd =
    content?.[entity]?.[entry]?.[property]?.headings &&
    content?.[entity]?.[entry]?.[property]?.rawMd;

  return (
    <div className="file-entity">
      {isMd && (
        <Editor
          language="markdown"
          value={content[entity][entry][property]?.rawMd}
          isMain
        />
      )}
      {!isMd && content?.[entity]?.[entry]?.[property] && (
        <Editor
          language="yaml"
          value={content[entity][entry][property]?.rawYaml}
          isMain
        />
      )}
      {schemas?.raw?.[entity] && (
        <Editor language="yaml" value={schemas.raw[entity]} readOnly />
      )}
    </div>
  );
}
