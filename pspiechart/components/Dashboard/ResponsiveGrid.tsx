import { Responsive, ResponsiveProps } from "react-grid-layout";
import sizeMe from "react-sizeme";
import Hero from "../Hero";

interface ResponsiveGridProps extends ResponsiveProps {
  size: { width: number; height: number };
}

function ResponsiveGrid(props: ResponsiveGridProps) {
  if (!props.size.width) return <Hero title="Loading..." />;

  return (
    <div className="h-100 w-100">
      <Responsive {...props} width={props.size.width} />
    </div>
  );
}

export default sizeMe()(ResponsiveGrid);
