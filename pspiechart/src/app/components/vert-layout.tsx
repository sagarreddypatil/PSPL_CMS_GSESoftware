"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface VertLayoutProps {
  left: React.ReactNode;
  children: React.ReactNode;
}

export default function VertLayout(props: VertLayoutProps) {
  return (
    <PanelGroup direction="horizontal">
      <Panel>{props.left}</Panel>
      <PanelResizeHandle className="w-0.5 bg-gray-200 hover:bg-gray-400" />
      <Panel>{props.children}</Panel>
    </PanelGroup>
  );
}
