import { useEffect, useState } from 'react';
/* —————————————————————————————————————————————————————————————————————————— */
import { useAppStore } from '../../store';
import { log } from '../../logger';
/* ··················../../logger··············································· */

export function stateLoader() {
  // const data = useAppStore((state) => state.data_server);
  const [change, setChange] = useState(Math.random());

  useEffect(() => {
    // const socket = new WebSocket('ws://localhost:5011');
    // // Connection opened
    // socket.addEventListener('open', (event) => {
    //   socket.send('Hello Server!');
    // });
    // // Listen for messages
    // socket.addEventListener('message', (event) => {
    // log(['Message from server ', event.data]);
    //   setTimestamp(new Date());
    // });
  }, []);

  const fetchData = useAppStore((state) => state.data_fetchServerData);
  // NOTE: This is a work in progress
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => {
      throw '(skipping full reload)';
    });
  }

  // useEffect(() => {
  //   setInterval(() => {
  //     setChange(Math.random());
  //   }, 4500);
  // }, []);

  // FIXME: Not picking up changes
  useEffect(() => {
    fetchData()
      .then((e) => log(e))
      .catch((e) => log(e));
  }, [change]);
  // timestamp

  const fetchSavedUiState = useAppStore((state) => state.ui_fetchSaved);

  useEffect(() => {
    fetchSavedUiState();
  }, []);

  // return null;
}
