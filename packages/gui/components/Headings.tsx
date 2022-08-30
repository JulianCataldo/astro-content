/* ·········································································· */
/* —————————————————————————————————————————————————————————————————————————— */

export default function Headings({ items }) {
  return (
    <>
      {Array.isArray(items) &&
        items.map((h) => {
          const Tag = `h${h.level}`;
          return (
            <div>
              <Tag>
                <span
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: h.html }}
                />
              </Tag>
            </div>
          );
        })}
    </>
  );
}
