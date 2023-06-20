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
        minSize={20}
        defaultSize={20}
      >
        {children[0]}
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-200 active:bg-rush hover:bg-rush" />
      <Panel onResize={props.onResize}>{children[1]}</Panel>
    </PanelGroup>
  );
}
