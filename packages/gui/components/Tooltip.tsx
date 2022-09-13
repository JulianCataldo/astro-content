// Bare example from: https://floating-ui.com/docs/react-dom-interactions
// https://codesandbox.io/s/icy-water-ktwif6?file=/src/App.tsx
// TODO: Refactor + lint

import { cloneElement, useState } from 'react';
import {
  Placement,
  offset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  useDismiss,
  useDelayGroupContext,
  useDelayGroup,
} from '@floating-ui/react-dom-interactions';
import { AnimatePresence, motion } from 'framer-motion';

/* ·········································································· */
/* —————————————————————————————————————————————————————————————————————————— */

interface Props {
  label: string | JSX.Element;
  placement?: Placement;
  children: JSX.Element;
  jsx?: boolean;
}

export default function Tooltip({
  children,
  label,
  placement = 'top',
  jsx = false,
}: Props) {
  const { delay, setCurrentId } = useDelayGroupContext();
  const [open, setOpen] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement,
    open,
    onOpenChange(open) {
      setOpen(open);

      if (open) {
        setCurrentId(label);
      }
    },
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay, restMs: 100 }),
    useFocus(context),
    useRole(context, { role: 'tooltip' }),
    useDismiss(context),
    useDelayGroup(context, { id: label }),
  ]);

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({ ref: reference, ...children.props }),
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              // When in "grouped phase", make the transition faster
              typeof delay === 'object' && delay.open === 1
                ? { duration: 0.0 }
                : { duration: 0.15 }
            }
            ref={floating}
            className="component-tooltip"
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            {...getFloatingProps()}
          >
            {jsx ? (
              label
            ) : (
              <div dangerouslySetInnerHTML={{ __html: label }}></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
