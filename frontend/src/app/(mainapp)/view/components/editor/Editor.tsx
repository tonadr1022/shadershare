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
import { ErrMsg, ShaderData } from "@/types/shader";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import ShaderExamplesDropdown from "./ShaderExamplesDropdown";

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

  const { theme, resolvedTheme } = useTheme();
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

export const MultiBufferEditor = React.memo(() => {
  const [renderPassEditIdx, setRenderPassEditIdx] = useState(0);
  const [errMsgs, setErrMsgs] = useState<(ErrMsg[] | null)[]>([]);

  const { setPaused, renderer, shaderDataRef } = useRendererCtx();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
                shaderDataRef.current.render_passes.map((pass) => pass.code),
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
      renderer.setShaderDirty(idx);
      shaderDataRef.current.render_passes[idx].code = newText;
      // setShaderData((prevData) => ({
      //   ...prevData,
      //   render_passes: prevData.render_passes.map((renderPass, i) =>
      //     i === idx ? { ...renderPass, code: newText } : renderPass,
      //   ),
      // }));
    },
    [renderer, shaderDataRef],
  );

  const onCompile = useCallback(
    (shaderData: ShaderData) => {
      const res = renderer.setShaders(
        shaderData.render_passes.map((pass) => pass.code),
      );
      setErrMsgs(res.errMsgs);
    },
    [renderer],
  );

  const onExampleSelect = useCallback(
    (shader: ShaderData) => {
      // TODO: uplaod these and make a new tab for them
      shaderDataRef.current = shader;
      // setShaderData(shader);
      onCompile(shader);
      renderer.restart();
    },
    [renderer, onCompile, shaderDataRef],
  );

  return (
    <div className=" flex flex-col w-full h-full">
      <Tabs defaultValue="0" className="m-0 p-0">
        <TabsList>
          {shaderDataRef.current.render_passes.map((renderPass, idx) => (
            <TabsTrigger
              value={idx.toString()}
              onClick={() => setRenderPassEditIdx(idx)}
              key={renderPass.pass_index}
            >
              Pass {idx}
            </TabsTrigger>
          ))}
        </TabsList>
        {shaderDataRef.current.render_passes.map((renderPass, idx) => (
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
              idx={idx}
              visible={renderPassEditIdx === idx}
              text={renderPass.code}
              onTextChange={onTextUpdate}
            />
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex flex-row">
        <ShaderExamplesDropdown onSelect={onExampleSelect} />
      </div>
    </div>
  );
});
MultiBufferEditor.displayName = "MultiBufferEditor";
