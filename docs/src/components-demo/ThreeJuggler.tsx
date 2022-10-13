import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import mod from './ThreeJuggler.module.scss';
// import './ThreeJuggler.scss';

const { testProp } = { testProp: 'foo' };

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
        <dodecahedronGeometry attach="geometry" args={[0.5, 0]} />
      )}
      <meshPhongMaterial color={color} attach="material" />
    </mesh>
  );
}

interface ThreeDemo {
  foo?: string;
  baz?: string;
}
interface Props extends Partial<ThreeDemo> {
  /** Object count, obviously */
  count?: number;

  /** Cool _variants_,…  */
  mode?: 'juggler' | 'lsd' | 'sharkTeeth';

  /** Some [color]() in your life  */
  hue: string;

  /**
   * Throw **some** `lemmings[]` 🐹
   *
   * The power of the lemming is undisputable
   */
  lemmings?: string[];

  children?: JSX.Element;

  /**
   * _Wow_.
   * @deprecated Don't use it */
  colorOffset?: number;
}
export default function ThreeJuggler({
  count = 3,
  colorOffset = 50,
  hue = '#b74e4e',
  mode = 'juggler',
  lemmings = [],
  children,
}: Props) {
  const [mousePos, setMousePos] = useState([0, 0]);
  // const [selMode, setMode] = useState(mode);

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
      {children}

      {/* {hue} */}
      <Canvas>
        {Array.from(Array(count)).map((_, key) => (
          <Box
            key={key}
            mode={mode}
            color={hue}
            position={[
              mousePos[0] + key * 1.5 - count,
              mousePos[1] * (key % 2 ? -1 : 1),
              3,
            ]}
          />
        ))}

        <directionalLight color="#ffffff" intensity={1} position={[-1, 2, 4]} />
      </Canvas>
      {lemmings?.map((lemming) => {
        return <strong>I'm {lemming} ! — </strong>;
      })}

      <div>
        <span>🎚 Mode: </span>
        {
          {
            lsd: {
              title: '🥴  LSD',
            },
            sharkTeeth: { name: '', title: '🦈  Shark teeth' },
            juggler: { name: '', title: '🥎 🏀 ⚾️  Juggler' },
          }[mode].title
        }
      </div>
    </div>
  );
}

ThreeJuggler.testbed = {
  schema: {
    properties: {
      count: {
        title: 'Object count',
        type: 'number',
        minimum: 1,
        maximum: 20,
      },
      mode: {
        title: 'Scene mode',
        type: 'string',
        enum: ['juggler', 'lsd', 'sharkTeeth'],
      },
      hue: {
        title: 'Color hue',
        type: 'string',
      },
      // lemmings: {
      //   type: 'array',
      //   items: { type: 'string' },
      // },
    },
  },
  ui: {
    count: {
      'ui:widget': 'range',
    },
    hue: {
      'ui:widget': 'color',
    },
  },
  presets: [
    {
      title: 'Basic',
      props: {
        count: 3,
        color: '#ababab',
      } as Props,
    },
  ],
};
