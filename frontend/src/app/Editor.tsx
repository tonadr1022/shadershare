"use client";

import CodeMirror from "@uiw/react-codemirror";
import React from "react";

const code = "const a = 0;";
type Props = {};

const Editor = (props: Props) => {
  return (
    <CodeMirror
      value={code}
      options={{
        mode: "jsx",
      }}
    />
  );
};

export default Editor;
