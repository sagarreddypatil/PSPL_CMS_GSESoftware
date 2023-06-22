import { Children } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface VertLayoutProps {
  children: React.ReactNode;
  onCollapse?: (collapsed: boolean) => void;
  onResize?: (size: number) => void;
  getSizeCallback?: (callback: () => number) => void;
}

export default function VertLayout(props: VertLayoutProps) {
  const children = Children.toArray(props.children);

  return (
    <PanelGroup direction="horizontal">
      <Panel
        collapsible={true}
        onCollapse={props.onCollapse}
        minSize={15}
        defaultSize={15}
      >
        {children[0]}
      </Panel>
      <PanelResizeHandle className="w-[2px] before:absolute before:w-[4px] before:h-full bg-gray-200 dark:bg-gray-700 before:active:bg-rush before:hover:bg-rush" />
      <Panel onResize={props.onResize}>{children[1]}</Panel>
    </PanelGroup>
  );
}
