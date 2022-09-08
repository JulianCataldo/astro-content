import type { Placement } from '@floating-ui/react-dom-interactions';
import cx from 'classnames';
import { useState } from 'react';
import Tooltip from './Tooltip';

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
    <Tooltip label="Copy to clipboard" placement={placement}>
      <div
        role="button"
        tabIndex={0}
        onClick={copy}
        onKeyPress={copy}
        className="component-copy-inline-code"
      >
        <pre>
          <div className={cx('overlay', { visible })}>Copied!</div>
          <span className="prefix">&gt; </span>
          <code>{text}</code>
        </pre>
      </div>
    </Tooltip>
  );
}

CopyInlineCode.defaultProps = {
  placement: undefined,
};
