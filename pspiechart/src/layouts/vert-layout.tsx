import { Children, useEffect, useRef, useState } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import SizedDiv from "../controls/sized-div";

interface VertLayoutProps {
  children: React.ReactNode;
  onCollapse?: (collapsed: boolean) => void;
  getSizeCallback?: (callback: () => number) => void;
}

export default function VertLayout(props: VertLayoutProps) {
  const children = Children.toArray(props.children);

  const [width, setWidth] = useState(-1);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);

  const [leftSize, setLeftSize] = useState(0);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  useEffect(() => {
    props.onCollapse?.(leftCollapsed);
  }, [leftCollapsed]);

  useEffect(() => {
    if (width > 0 && width < 640) {
      leftPanelRef.current?.collapse();
    }
  }, [width]);

  return (
    <SizedDiv onResize={(width) => setWidth(width)}>
      <PanelGroup direction="horizontal">
        <Panel
          collapsible={true}
          onCollapse={setLeftCollapsed}
          minSize={15}
          defaultSize={15}
          onResize={setLeftSize}
          ref={leftPanelRef}
          className="!overflow-visible"
          style={{
            width: `${leftSize}%`,
            visibility: leftCollapsed ? "hidden" : "visible",
          }}
        >
          {children[0]}
        </Panel>
        {width > 640 ? (
          <PanelResizeHandle className="w-[2px] bg-gray-200 dark:bg-gray-700 relative after:active:bg-rush after:hover:bg-rush after:absolute after:w-[4px] after:h-full after:-left-[1px] before:absolute before:h-full before:w-[16px] before:-left-[6px] before:z-50" />
        ) : (
          <></>
        )}
        <Panel>{children[1]}</Panel>
      </PanelGroup>
    </SizedDiv>
  );
}
