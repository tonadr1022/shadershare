"use client";
import CodeMirror from "@uiw/react-codemirror";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";

import ShaderRenderer from "../renderer/ShaderRenderer";
// import dynamic from "next/dynamic";
// const ShaderRenderer = dynamic(() => import("./renderer/ShaderRenderer"), {
//   ssr: false,
// });
// import "codemirror/lib/codemirror.css";
// import "codemirror/theme/material.css";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {};

const ShaderEditor = (props: Props) => {
  const shaderRendererRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  const [smallScreen, setSmallScreen] = useState(false);
  const [totEditorSize, setTotEditorSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [code, setCode] = useState("console.log('hello world!');");
  const onChange = useCallback((val, viewUpdate) => {
    console.log(val, viewUpdate);
    setCode(val);
  }, []);

  // 800x450,640/360,512x288,420x236
  useEffect(() => {
    const container = shaderRendererRef.current;
    const editor = editorRef.current;
    if (!container || !editor) return;

    const resizeCanvas = () => {};
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const onEditorResize = () => {
      const containerWidth = container.offsetWidth;
      setHeight(containerWidth / 1.7777777777);
      setSmallScreen(containerWidth < 800);
      setCanvasSize({ width: containerWidth, height: container.offsetHeight });
      setTotEditorSize({
        width: editor.offsetWidth,
        height: editor.offsetHeight,
      });
    };
    const editorResizeObserver = new ResizeObserver(onEditorResize);
    editorResizeObserver.observe(editor);
    return () => {
      editorResizeObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col md:bg-blue-500 lg:bg-green-700 sm:bg-red-500 xl:bg-yellow-500 bg-purple-500 h-screen">
      <h1 className="">
        shader editor {canvasSize.width}x{canvasSize.height}
      </h1>
      <div
        className="flex justify-center items-center h-full bg-black"
        ref={editorRef}
      >
        <div className="flex flex-col md:flex-row w-full h-full gap-8">
          <div
            ref={shaderRendererRef}
            style={{
              height:
                smallScreen || totEditorSize.width > 800 ? `${height}px` : "", // only set the height if small
            }}
            // lg:w-[640px] lg:h-[360px] xl:w-[800px] xl:h-[450px]
            className="bg-gray-200 p-0 relative w-full md:w-[400px] md:h-[236px] lg:w-[512px] lg:h-[288px] md:flex-grow"
          >
            <ShaderRenderer shaderId="your-shader-id" />
          </div>
          <div className="w-full lg:w-[800px]">
            <CodeMirror value={code} theme={tokyoNight} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderEditor;
