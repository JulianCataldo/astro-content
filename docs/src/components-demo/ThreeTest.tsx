import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import mod from './ThreeTest.module.scss';
// import './ThreeTest.scss';

function Box({ position, color, mode }) {
  const ref = useRef();
  useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01));

  return (
    <mesh position={position} ref={ref}>
      {mode === 'lsd' && (
        <torusBufferGeometry attach="geometry" args={[1.6, 3, 4, 23]} />
      )}
      {mode === 'sharkTeeth' && (
        <coneGeometry attach="geometry" args={[0.5, 2, 3.2]} />
      )}
      {mode === 'juggler' && (
        <dodecahedronBufferGeometry attach="geometry" args={[0.5, 0]} />
      )}
      <meshPhongMaterial color={color} attach="material" />
    </mesh>
  );
}

export default function ThreeTest({ count = 3 }) {
  const [mousePos, setMousePos] = useState([0, 0]);
  const [mode, setMode] = useState('juggler');

  function onDocumentMouseMove(event) {
    setMousePos([
      (event.clientX / window.innerWidth) * 5 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    ]);
  }
  useEffect(() => {
    document.addEventListener('mousemove', onDocumentMouseMove, false);
  });

  return (
    <div className={mod.wrapper}>
      <Canvas>
        {Array.from(Array(count)).map((_, key) => {
          return (
            <Box
              mode={mode}
              color={`hsla(${key * 50}, 70%, 50%, 1)`}
              position={[
                mousePos[0] + key * 1.5 - count,
                mousePos[1] * (key % 2 ? -1 : 1),
                3,
              ]}
            />
          );
        })}

        <directionalLight color="#ffffff" intensity={1} position={[-1, 2, 4]} />
      </Canvas>
      <div>
        <span>🎚 Mode: </span>
        <button onClick={() => setMode('lsd')}>🥴&nbsp; LSD</button>
        <button onClick={() => setMode('sharkTeeth')}>
          🦈&nbsp; Shark teeth
        </button>
        <button onClick={() => setMode('juggler')}>
          🥎 🏀 ⚾️&nbsp; Juggler
        </button>
      </div>
    </div>
  );
}
