"use client";

import SortableTree, { TreeItem } from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import { useState } from "react";

export default function ObjectTree() {
  const [treeData, setTreeData] = useState<Array<TreeItem>>([
    { title: "src/", children: [{ title: "index.js" }] },
  ]);

  return (
    <SortableTree
      treeData={treeData}
      onChange={(treeData) => setTreeData(treeData)}
      theme={FileExplorerTheme}
    />
  );
}
