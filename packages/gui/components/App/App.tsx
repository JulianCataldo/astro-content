import { useEffect, useState } from 'react';
import { ReactLocation, Router } from '@tanstack/react-location';
/* ·········································································· */
import { useKeyBoardShortcuts } from './keyboard-shortcuts';
import Toolbar from '../Toolbar';
import CopyInlineCode from '../CopyInlineCode';
// import './App.scss';
/* ·········································································· */
import { useAppStore } from '../../store';
import { stateLoader } from './state-loader';
import Gui from './Gui';
// import { log } from '../../logger';
/* —————————————————————————————————————————————————————————————————————————— */

const location = new ReactLocation();

interface Props {
  isValidContentBase: boolean;
  children: JSX.Element;
}
export default function App({ isValidContentBase, children }: Props) {
  const { entity, entry, property } = useAppStore((state) => state.ui_route);

  useKeyBoardShortcuts();

  stateLoader();

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    /* For client-only stuffs (`SplitPane` for ex.) */
    setDidMount(true);

    // HACK: For ssr-entrypoint first load
    // @ts-ignore
    window.loaded = true;
  });

  const setRoute = useAppStore((state) => state.ui_setRoute);

  return (
    <Router
      location={location}
      routes={[
        {
          path: '__content/:entity/:entry/:property',
          loader: (route) => {
            const { params } = route;
            setRoute(params.entity, params.entry, params.property);
            console.log({ route });
            return {};
          },
          // NOTE: Could use kebab-case instead.
          caseSensitive: true,
        },
        {
          path: '__content/:entity',
          loader: (route) => {
            const { params } = route;
            setRoute(params.entity, false, false);
            return {};
          },
          caseSensitive: true,
        },
      ]}
    >
      <div className="component-app">
        <Toolbar />
        {!isValidContentBase && (
          <div className="message-no-database">
            <strong>No valid content base was found</strong>
            <hr />
            <p>Create a minimal one by running:</p>
            <CopyInlineCode text="pnpm content setup" />
          </div>
        )}
        {isValidContentBase && didMount ? (
          <Gui hasNoRoute={!entity && !entry && !property} />
        ) : (
          <div className="message-loading-database">
            Loading content base…
            <br />
            You might need to reload the page.
            {children}
          </div>
        )}
      </div>
    </Router>
  );
}
