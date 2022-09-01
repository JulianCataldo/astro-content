/* ·········································································· */
/* —————————————————————————————————————————————————————————————————————————— */

export default function Headings({ items }) {
  return (
    Array.isArray(items) &&
    items.map((h, key) => {
      const Tag = `h${h.depth ?? '2'}`;
      return (
        <div key={key}>
          <Tag>
            {/* <span
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: h.html }}
                /> */}
            <span>{h.text}</span>
          </Tag>
        </div>
      );
    })
  );
}
