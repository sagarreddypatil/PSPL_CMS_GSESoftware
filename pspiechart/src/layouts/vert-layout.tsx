"use client";

import { Children, useId } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface VertLayoutProps {
  children: React.ReactNode;
  onCollapse?: (collapsed: boolean) => void;
}

export default function VertLayout(props: VertLayoutProps) {
  const children = Children.toArray(props.children);
  const id = useId();
  // assert(children.length === 2);

  return (
    <PanelGroup direction="horizontal" autoSaveId={id}>
      <Panel collapsible={true} onCollapse={props.onCollapse}>
        {children[0]}
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-200 active:bg-rush hover:bg-rush" />
      <Panel>{children[1]}</Panel>
    </PanelGroup>
  );
}
