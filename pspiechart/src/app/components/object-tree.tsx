"use client";

import { useState } from "react";
import SortableTree, { TreeItem } from "@nosferatu500/react-sortable-tree";
// @ts-ignore
import FileExplorerTheme from "@nosferatu500/theme-file-explorer"; // no types for this lib

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
