/* ·········································································· */
import type { ExtraMd } from '@astro-content/types/file';
// import './Headings.scss';
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  items: ExtraMd['headingsCompiled'];
  close: () => void;
}
export default function Headings({ items, close }: Props) {
  const jumpToHeading = (id: string) => {
    // IDEA: Map to browser current location?
    // window.location.hash = 'the_hash;
    // const heading = document.querySelector('.markdown-preview iframe').contentWindow.getElementById(id);
    // const preview = document.querySelector('.preview');
    // FIXME: Possibly undefined
    // preview?.scrollTo({
    //   top:
    //     heading?.getBoundingClientRect().top +
    //     preview.scrollTop -
    //     preview.getBoundingClientRect().top -
    //     50,
    //   behavior: 'smooth',
    // });
    // Alt method:
    // heading?.scrollIntoView();

    // FIXME: HTML Element typings
    const iframe = document.querySelector('.markdown-preview iframe');

    iframe.contentWindow.location.hash = id;

    close();
  };
  return items?.map((h, key) => {
    // NOTE: use `h` tag?
    // FIXME: Correct generic tag typings
    // const Tag = `h${h.depth}`;
    const level = h.depth;
    return (
      // FIXME: JSX A11y
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div key={key} onClick={() => jumpToHeading(h.slug)}>
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
