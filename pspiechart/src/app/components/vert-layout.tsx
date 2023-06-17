"use client";

import assert from "assert";
import { Children } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface VertLayoutProps {
  children: React.ReactNode;
}

export default function VertLayout(props: VertLayoutProps) {
  const children = Children.toArray(props.children);
  assert(children.length === 2);

  return (
    <PanelGroup direction="horizontal">
      <Panel>{children[0]}</Panel>
      <PanelResizeHandle className="w-0.5 bg-gray-200 hover:bg-gray-400" />
      <Panel>{children[1]}</Panel>
    </PanelGroup>
  );
}
