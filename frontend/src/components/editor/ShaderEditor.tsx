"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "./Editor";
import { createRenderer } from "../renderer/Renderer";
import { createEmptyResult } from "../util";
type Props = {
  shaderId: string;
};

const ShaderEditor = ({ shaderId }: Props) => {
  const shaderRendererRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  const [smallScreen, setSmallScreen] = useState(false);
  const [renderer, setRenderer] = useState<IRenderer | null>(null);
  // TODO: Import from somewhere else
  const [savedText, setSavedText] =
    useState(`void imageMain(vec2 fragCoord, vec3 iResolution) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    FragColor = vec4(col,1.0);
}`);

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
  const onCompile = useCallback(
    (text: string): EmptyResult => {
      if (!renderer) return createEmptyResult();
      const res = renderer?.setShader(text);
      setSavedText(text);
      return res;
    },
    [renderer],
  );

  // 800x450,640/360,512x288,420x236
  useEffect(() => {
    const container = shaderRendererRef.current;
    const editor = editorRef.current;
    if (!container || !editor) return;

    const resizeCanvas = () => {};
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const onViewEditorResize = () => {
      const containerWidth = container.offsetWidth;
      setHeight(containerWidth / 1.7777777777);
      setSmallScreen(containerWidth < 800);
      setCanvasSize({ width: containerWidth, height: container.offsetHeight });
      setTotEditorSize({
        width: editor.offsetWidth,
        height: editor.offsetHeight,
      });
    };
    const viewEditorResizeObserver = new ResizeObserver(onViewEditorResize);
    viewEditorResizeObserver.observe(editor);
    setRenderer(createRenderer());
    return () => {
      viewEditorResizeObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col md:bg-blue-500 lg:bg-green-700 sm:bg-red-500 xl:bg-yellow-500 bg-purple-500 h-screen">
      <h1 className="">
        shader viewer {canvasSize.width}x{canvasSize.height}. {shaderId}
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
            <ShaderRenderer
              renderer={renderer}
              initialData={{ fragmentText: savedText }}
            />
          </div>
          <div className="w-full lg:w-[800px]">
            <Editor onCompile={onCompile} initialValue={savedText} />
            <div>saved: {savedText}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderEditor;
