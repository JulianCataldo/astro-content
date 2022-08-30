import { useState, useEffect } from 'react';
/* —————————————————————————————————————————————————————————————————————————— */
import { useAppStore } from '../store';
/* ·········································································· */

export default function State(params) {
  const [timestamp, setTimestamp] = useState();

  const state = useAppStore((state) => state.data);

  useEffect(() => {
    // const socket = new WebSocket('ws://localhost:5011');
    // // Connection opened
    // socket.addEventListener('open', (event) => {
    //   socket.send('Hello Server!');
    // });
    // // Listen for messages
    // socket.addEventListener('message', (event) => {
    //   console.log('Message from server ', event.data);
    //   setTimestamp(new Date());
    // });
  }, []);

  const fetchData = useAppStore((state) => state.fetchData);
  useEffect(() => {
    fetchData();
  }, [timestamp]);

  const fetchCurrentRoute = useAppStore((state) => state.fetchCurrentRoute);
  useEffect(() => {
    fetchCurrentRoute();
  }, []);

  return <div></div>;
  return (
    <details>
      <h1>STATE</h1>
      <pre>
        <code>{JSON.stringify(state, null, 2)} </code>
      </pre>
    </details>
  );
}
