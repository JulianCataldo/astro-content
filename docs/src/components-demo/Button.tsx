interface Props {
  variant: 'fancy' | 'default';
  /** Wow */
  hello: {
    test: string;
    testAaa: number;
  };
}

export default function Button({ children }: Props) {
  return (
    <button>
      {children}
      {/* <Icon icon="" client:load /> */}
    </button>
  );
}
