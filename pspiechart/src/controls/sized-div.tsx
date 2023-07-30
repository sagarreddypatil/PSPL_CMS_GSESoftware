import useResizeObserver from "use-resize-observer";

interface SizedDivProps {
  children: React.ReactNode;
  onResize: (width: number, height: number) => void;
  className?: string;
}

const noop = (n: number) => n;

export default function SizedDiv(props: SizedDivProps) {
  const { ref } = useResizeObserver<HTMLDivElement>({
    round: noop,
    onResize: ({ width, height }) => props.onResize(width ?? 1, height ?? 1),
  });

  return (
    <div className={`h-full w-full ${props.className}`} ref={ref}>
      {props.children}
    </div>
  );
}
