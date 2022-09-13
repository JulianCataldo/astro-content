/* ·········································································· */
import type { ExtraMd } from '@astro-content/types/file';
// import './Headings.scss';
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  items: ExtraMd['headingsCompiled'];
}
export default function Headings({ items }: Props) {
  const jumpToHeading = (id: string) => {
    // IDEA: Map to browser current location?
    // window.location.hash = 'the_hash;
    const heading = document.getElementById(id);
    const preview = document.querySelector('.preview');
    // FIXME:
    preview?.scrollTo({
      top:
        heading?.getBoundingClientRect().top +
        preview.scrollTop -
        preview.getBoundingClientRect().top -
        50,
      behavior: 'smooth',
    });
    // Alt method:
    // heading?.scrollIntoView();
  };
  return items?.map((h, key) => {
    // NOTE: use `h` tag?
    // const Tag = `h${h.depth}`;
    const level = h.depth;
    return (
      // FIXME: JSX A11y
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div key={key} onClick={() => jumpToHeading(h.slug)}>
        {/* FIXME: Correct generic tag typings */}
        <div className={`h-level-${level}`}>
          {/* {JSON.stringify(h)} */}
          {/* TODO: Sync scrollbars: https://stackoverflow.com/a/69113028/2890472 */}
          {/* <span
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: h.html }}
        /> */}
          <span>{h.text}</span>
        </div>
      </div>
    );
  });
}
