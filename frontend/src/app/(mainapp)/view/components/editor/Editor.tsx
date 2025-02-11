"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { debounce } from "lodash";
import CodeMirror, {
  ReactCodeMirrorRef,
  StateEffect,
  StateField,
} from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { vim } from "@replit/codemirror-vim";
import { indentUnit } from "@codemirror/language";
import {
  Decoration,
  DecorationSet,
  drawSelection,
  EditorView,
} from "@codemirror/view";
import { useRendererCtx } from "@/context/RendererContext";
import { ErrorWidget } from "./ErrorWidget";
import { ErrMsg, ShaderData } from "@/types/shader";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import ShaderExamplesDropdown from "./ShaderExamplesDropdown";
import { IRenderer } from "../renderer/Renderer";

// type EditorOptions = {
//   fontSize: number;
//   keyBinding: "vim";
//   tabSize: 4;
//   relativeLineNumber: true;
// };

// const editorReducer = (state: ShaderData, action: any): ShaderData => {
//   switch (action.type) {
//     case "SET_RENDER_PASS_CODE":
//       return {
//         ...state,
//         render_passes: state.render_passes.map((renderPass, idx) =>
//           idx === action.payload.pass_idx
//             ? { ...renderPass, code: action.payload.code }
//             : renderPass,
//         ),
//       };
//     default:
//       return state;
//   }
// };

const clearErrorsEffect = StateEffect.define<void>();
const errorEffect = StateEffect.define<ErrMsg>();
const errorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (decorations, transaction) => {
    decorations = decorations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(errorEffect)) {
        const linePos = transaction.state.doc.line(effect.value.line);
        const deco = Decoration.widget({
          widget: new ErrorWidget(effect.value.message),
          side: 1,
        }).range(linePos.to);
        return decorations.update({ add: [deco] });
      }
      if (effect.is(clearErrorsEffect)) {
        return Decoration.none;
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

type Props2 = {
  errMsgs: ErrMsg[] | null;
  text: string;
  visible: boolean;
  idx: number;
  onCompile: (focusedBufferIdx: number, focusedBufferText: string) => void;
  onTextChange: (text: string, idx: number) => void;
};

const keyBinds = [
  { key: "p", alt: true, action: "pause", name: "Pause" },
  { key: "Enter", alt: true, action: "compile", name: "Compile" },
  { key: "r", alt: true, action: "restart", name: "Restart" },
  { key: "b", alt: true, action: "focus", name: "Focus Editor" },
];

export const Editor2 = React.memo((props: Props2) => {
  const { theme, resolvedTheme } = useTheme();

  const { visible } = props;

  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    if (!editor.view) return;
    const errMsgs = props.errMsgs;
    editor.view.dispatch({ effects: clearErrorsEffect.of() });
    // if err msgs are passed, show them
    if (errMsgs !== null && errMsgs.length) {
      const editor = editorRef.current;
      if (editor && editor.view) {
        editor.view.dispatch({
          effects: errMsgs.map((err: ErrMsg) =>
            errorEffect.of({
              line: err.line,
              message: err.message || "",
            }),
          ),
        });
      }
    }
  }, [props.errMsgs]);

  const { text, onTextChange, onCompile } = props;
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const { setPaused, renderer } = useRendererCtx();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const keybind of keyBinds) {
        if (event.key === keybind.key && (keybind.alt ? event.altKey : true)) {
          if (keybind.action === "focus") {
            editorRef.current?.view?.focus();
          } else if (keybind.action === "pause") {
            setPaused((prev) => !prev);
          } else if (keybind.action === "restart" && renderer) {
            renderer.restart();
          } else if (keybind.action === "compile" && onCompile) {
            const editor = editorRef.current;
            if (editor && editor.view) {
              const text = editor.view.state.doc.toString();
              // TODO: dont call this from props?
              onCompile(props.idx, text);
            }
          }
        }
      }
    },
    [onCompile, props.idx, setPaused, renderer],
  );

  useEffect(() => {
    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  const extensions = useMemo(
    () => [
      cpp(),
      indentUnit.of("    "),
      vim({ status: false }),
      // TODO: only active for vim mode
      drawSelection({ cursorBlinkRate: 0 }),
      errorField,
    ],

    [],
  );

  const debouncedSet = React.useMemo(
    () =>
      debounce((text: string, idx: number) => {
        onTextChange(text, idx);
      }, 750),
    [onTextChange],
  );

  const codeMirrorOnTextChange = useCallback(
    (text: string) => {
      debouncedSet(text, props.idx);
    },
    [debouncedSet, props.idx],
  );
  const themeStr = useMemo(() => {
    switch (resolvedTheme || theme) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      default:
        return "light";
    }
  }, [theme, resolvedTheme]);

  return (
    <CodeMirror
      ref={editorRef}
      value={text}
      theme={themeStr}
      className={cn(
        props.visible ? "" : "hidden",
        " border-2 cm-editor2 overflow-auto h-[calc(max(300px,100vh-310px))]",
      )}
      onChange={codeMirrorOnTextChange}
      autoFocus={false}
      extensions={extensions}
    />
  );
});
Editor2.displayName = "Editor2";

type Props3 = {
  initialShaderData: ShaderData;
  renderer: IRenderer;
};

export const MultiBufferEditor = React.memo((props: Props3) => {
  const { renderer } = props;
  const [shaderData, setShaderData] = useState(props.initialShaderData);
  const [renderPassEditIdx, setRenderPassEditIdx] = useState(0);
  const [errMsgs, setErrMsgs] = useState<(ErrMsg[] | null)[]>([]);

  const onTextUpdate = useCallback(
    (newText: string, idx: number) => {
      renderer.setShaderDirty(idx);
      setShaderData((prevData) => ({
        ...prevData,
        render_passes: prevData.render_passes.map((renderPass, i) =>
          i === idx ? { ...renderPass, code: newText } : renderPass,
        ),
      }));
    },
    [renderer],
  );

  const onBufferIdxChange = useCallback((idx: number) => {
    setRenderPassEditIdx(idx);
  }, []);

  const onCompile = useCallback(
    (focusedBufferIdx: number, focusedBufferText: string) => {
      const allShaderText = shaderData.render_passes.map((pass, idx) =>
        idx !== focusedBufferIdx ? pass.code : focusedBufferText,
      );
      const res = renderer.setShaders(allShaderText);
      setErrMsgs(res.errMsgs);
    },
    [renderer, shaderData.render_passes],
  );

  return (
    <div className=" flex flex-col w-full h-full">
      <Tabs defaultValue="0" className="m-0 p-0">
        <TabsList>
          {shaderData.render_passes.map((renderPass, idx) => (
            <TabsTrigger
              value={idx.toString()}
              onClick={() => onBufferIdxChange(idx)}
              key={renderPass.pass_idx}
            >
              Pass {idx}
            </TabsTrigger>
          ))}
        </TabsList>
        {shaderData.render_passes.map((renderPass, idx) => (
          <TabsContent
            forceMount={true}
            value={idx.toString()}
            key={renderPass.name}
            className={cn(
              renderPassEditIdx === idx ? "" : "hidden",
              "bg-background m-0",
            )}
          >
            <Editor2
              errMsgs={errMsgs[idx]}
              onCompile={onCompile}
              idx={idx}
              visible={renderPassEditIdx === idx}
              text={renderPass.code}
              onTextChange={onTextUpdate}
            />
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex flex-row">
        <ShaderExamplesDropdown
          onSelect={(shader: ShaderData) => {
            // TODO: uplaod these and make a new tab for them
            setShaderData(shader);
          }}
        />
      </div>
    </div>
  );
});
MultiBufferEditor.displayName = "MultiBufferEditor";
