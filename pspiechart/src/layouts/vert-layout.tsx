"use client";

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
      <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-900 active:bg-gray-300 hover:bg-gray-300 dark:active:bg-gray-700 dark:hover:bg-gray-700" />
      <Panel onResize={props.onResize}>{children[1]}</Panel>
    </PanelGroup>
  );
}
