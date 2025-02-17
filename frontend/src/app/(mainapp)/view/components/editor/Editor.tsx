"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { ErrMsg } from "@/types/shader";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResolvedTheme } from "@/hooks/hooks";
import ShaderInputEdit from "./ShaderInputEdit";

// type EditorOptions = {
//   fontSize: number;
//   keyBinding: "vim";
//   tabSize: 4;
//   relativeLineNumber: true;
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
  onTextChange: (text: string, idx: number) => void;
};

type KeyBind = {
  name: string;
  key: string;
  alt?: boolean;
};

type KeyBindsMap = Record<string, KeyBind>;

const keyBindsMap: KeyBindsMap = {
  pause: { key: "p", alt: true, name: "Pause" },
  compile: { key: "Enter", alt: true, name: "Compile" },
  restart: { key: "r", alt: true, name: "Restart" },
  focus: { key: "b", alt: true, name: "Focus Editor" },
  unfocus: { key: "Escape", name: "Unfocus Editor" },
};

const isKeyboardEvent = (action: string, event: KeyboardEvent) => {
  return (
    event.key === keyBindsMap[action].key &&
    (keyBindsMap[action].alt ? event.altKey : true)
  );
};

export const Editor2 = React.memo((props: Props2) => {
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

  const { text, onTextChange } = props;
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  useEffect(() => {
    if (visible) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!editorRef.current || !editorRef.current.view) return;
        if (isKeyboardEvent("focus", event)) {
          editorRef.current.view.focus();
        } else if (isKeyboardEvent("unfocus", event)) {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown, { passive: true });
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible]);

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

  const codeMirrorOnTextChange = useCallback(
    (text: string) => {
      onTextChange(text, props.idx);
    },
    [onTextChange, props.idx],
  );

  const themeStr = useResolvedTheme();

  return (
    <CodeMirror
      ref={editorRef}
      value={text}
      theme={themeStr}
      suppressHydrationWarning
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

export const MultiBufferEditor = React.memo(() => {
  const [renderPassEditIdx, setRenderPassEditIdx] = useState(0);
  const [errMsgs, setErrMsgs] = useState<(ErrMsg[] | null)[]>([]);
  const [, setInOutTabIdx] = useState(1);

  const { codeDirtyRef, setPaused, renderer, shaderDataRef } = useRendererCtx();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!renderer) return;
      Object.entries(keyBindsMap).forEach(([action, keybind]) => {
        if (event.key === keybind.key && (keybind.alt ? event.altKey : true)) {
          switch (action) {
            case "pause":
              setPaused((prev) => !prev);
              break;
            case "restart":
              renderer.restart();
              break;
            case "compile":
              const res = renderer.setShaders(
                shaderDataRef.current.shader_outputs,
              );
              setErrMsgs(res.errMsgs);
              break;
            default:
              break;
          }
        }
      });
    };
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [renderer, setPaused, shaderDataRef]);

  const onTextUpdate = useCallback(
    (newText: string, idx: number) => {
      if (!renderer) return;
      renderer.setShaderDirty(idx);
      codeDirtyRef.current[idx] = true;

      shaderDataRef.current.shader_outputs[idx].code = newText;
    },
    [renderer, shaderDataRef, codeDirtyRef],
  );

  return (
    <div className=" flex flex-col w-full h-full">
      <Tabs
        defaultValue="1"
        className="flex flex-col w-full h-full bg-background"
      >
        <TabsList>
          <TabsTrigger value="0" onClick={() => setInOutTabIdx(0)}>
            Inputs
          </TabsTrigger>
          <TabsTrigger value="1" onClick={() => setInOutTabIdx(1)}>
            Outputs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="0">
          <ShaderInputEdit />
        </TabsContent>
        <TabsContent value="1">
          <Tabs defaultValue="0" className="m-0 p-0">
            <TabsList>
              {shaderDataRef.current.shader_outputs.map((output, idx) => (
                <TabsTrigger
                  value={idx.toString()}
                  onClick={() => setRenderPassEditIdx(idx)}
                  key={output.name}
                >
                  Pass {idx}
                </TabsTrigger>
              ))}
            </TabsList>
            {shaderDataRef.current.shader_outputs.map((output, idx) => (
              <TabsContent
                forceMount={true}
                value={idx.toString()}
                key={output.name}
                className={cn(
                  renderPassEditIdx === idx ? "" : "hidden",
                  "bg-background m-0",
                )}
              >
                <Editor2
                  errMsgs={errMsgs[idx]}
                  idx={idx}
                  visible={renderPassEditIdx === idx}
                  text={output.code}
                  onTextChange={onTextUpdate}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
});
MultiBufferEditor.displayName = "MultiBufferEditor";
