import { useEffect } from 'react';
/* —————————————————————————————————————————————————————————————————————————— */
import { useAppStore } from '../../store';
import { log } from '../../logger';
/* ··················../../logger··············································· */

export function stateLoader() {
  // const data = useAppStore((state) => state.data_server);

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
  useEffect(() => {
    fetchData()
      .then((e) => log(e))
      .catch(() => null);
  }, []);
  // timestamp

  const fetchSavedUiState = useAppStore((state) => state.ui_fetchSaved);

  useEffect(() => {
    fetchSavedUiState();
  }, []);

  // return null;
}