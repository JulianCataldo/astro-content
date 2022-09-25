// TODO: Refactor
// Example taken from: https://codesandbox.io/s/wandering-dream-qwe6dj?file=/src/App.tsx:0-2588

import React, { cloneElement, useMemo, useState } from 'react';
import {
  useFloating,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
  useId,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
} from '@floating-ui/react-dom-interactions';
import { mergeRefs } from 'react-merge-refs';
import useAppStore from '../store';

interface Props {
  open?: boolean;
  render: (props: {
    close: () => void;
    labelId: string;
    descriptionId: string;
  }) => React.ReactNode;
  children: JSX.Element;
}

export default function CommandPalette({
  render,
  open: passedOpen = false,
  children,
}: Props) {
  const commandPaletteVisibility = useAppStore(
    (state) => state.ui_commandPaletteVisibility,
  );
  const [open, setOpen] = useState(passedOpen);

  const { reference, floating, context } = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context),
    useDismiss(context),
  ]);

  // Preserve the consumer's ref
  const ref = useMemo(
    () => mergeRefs([reference, (children as any).ref]),
    [reference, children],
  );

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      <FloatingPortal>
        {open && (
          <FloatingOverlay
            lockScroll
            style={{
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(25, 25, 25, 0.2)',
            }}
          >
            <FloatingFocusManager context={context}>
              <div
                ref={floating}
                className="Dialog"
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                {...getFloatingProps()}
              >
                {render({
                  close: () => setOpen(false),
                  labelId,
                  descriptionId,
                })}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </>
  );
}
