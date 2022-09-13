import type { Placement } from '@floating-ui/react-dom-interactions';
import cx from 'classnames';
import { useState } from 'react';
// import Tooltip from './Tooltip';
// import './CopyInlineCode.scss';

interface Props {
  text: string;
  placement?: Placement;
}
export default function CopyInlineCode({ text, placement }: Props) {
  const [visible, setVisible] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setVisible(true);
        setTimeout(() => setVisible(false), 1500);
      })
      .catch(() => null);
  };

  return (
    // TODO: Make a Tooltip hover group
    // <Tooltip label="Copy to clipboard" placement={placement}>
    <div
      role="button"
      tabIndex={0}
      onClick={copy}
      onKeyPress={copy}
      className="component-copy-inline-code"
    >
      <div className={cx('overlay', { visible })}>Copied to clipboard</div>
      <pre>
        <span className="prefix">&gt; </span>
        <code>{text}</code>
      </pre>
    </div>
    // </Tooltip>
  );
}

CopyInlineCode.defaultProps = {
  placement: undefined,
};
