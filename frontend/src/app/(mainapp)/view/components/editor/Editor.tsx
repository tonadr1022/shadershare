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
import { ErrMsg, ShaderOutput, ShaderOutputName } from "@/types/shader";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResolvedTheme } from "@/hooks/hooks";
import ShaderInputEdit from "./ShaderInputEdit";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { createShaderOutput } from "@/api/shader-api";
import { toast } from "sonner";
import {
  defaultBufferFragmentCode,
  defaultCommonBufferCode,
} from "../renderer/Renderer";

// type EditorOptions = {
//   fontSize: number;
//   keyBinding: "vim";
//   tabSize: 4;
//   relativeLineNumber: true;
// };

const shaderOutputNames: ShaderOutputName[] = [
  "Common",
  "Buffer A",
  "Buffer B",
  "Buffer C",
  "Buffer D",
  "Buffer E",
];

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
  errMsgs?: ErrMsg[] | null;
  text: string;
  visible: boolean;
  name: ShaderOutputName;
  onTextChange: (text: string, name: ShaderOutputName) => void;
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
    if (errMsgs !== null && errMsgs !== undefined && errMsgs.length) {
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
      onTextChange(text, props.name);
    },
    [onTextChange, props.name],
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
  const [errMsgs, setErrMsgs] = useState<Map<
    ShaderOutputName,
    ErrMsg[] | null
  > | null>(null);

  const { codeDirtyRef, setPaused, renderer, shaderDataRef } = useRendererCtx();
  const [, forceUpdate] = useState(0);

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
    (newText: string, name: ShaderOutputName) => {
      if (!renderer) return;
      const output = shaderDataRef.current.shader_outputs.find(
        (output) => output.name === name,
      )!;
      // compare name string for type coherence
      if (output.type !== "common" && output.name !== "Common") {
        renderer.setShaderDirty(output.name);
      }
      codeDirtyRef.current.set(name, true);
      // TODO: make this into dictionary
      output.code = newText;
    },
    [renderer, shaderDataRef, codeDirtyRef],
  );
  const hasBuffer = useCallback(
    (name: string) => {
      for (const output of shaderDataRef.current.shader_outputs) {
        if (output.name === name) {
          return true;
        }
      }
      return false;
    },
    [shaderDataRef],
  );
  const afterCreateShaderOutput = useCallback(
    (shaderOutput: ShaderOutput) => {
      shaderDataRef.current.shader_outputs.push(shaderOutput);
      codeDirtyRef.current.set(shaderOutput.name, false);
      shaderDataRef.current.shader_outputs.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    },
    [codeDirtyRef, shaderDataRef],
  );
  const createShaderOutputMut = useMutation({
    mutationFn: createShaderOutput,
    onError: () => {
      toast.error("Failed to create shader output");
    },
    onSuccess: (shaderOutput: ShaderOutput) => {
      afterCreateShaderOutput(shaderOutput);
    },
  });

  // need to make a new shader output on the backend
  const handleAddShaderOutput = useCallback(
    async (name: ShaderOutputName) => {
      const type = name === "Common" ? "common" : "buffer";
      const shaderID = shaderDataRef.current.shader.id || "";
      const newOutput: ShaderOutput = {
        name,
        type: type,
        code:
          name === "Common"
            ? defaultCommonBufferCode
            : defaultBufferFragmentCode,
      };

      if (shaderID !== "") {
        newOutput.shader_id = shaderID;
        createShaderOutputMut.mutate(newOutput);
      } else {
        afterCreateShaderOutput(newOutput);
      }
      forceUpdate((prev) => prev + 1);
    },
    [afterCreateShaderOutput, shaderDataRef, createShaderOutputMut],
  );

  return (
    <div className=" flex flex-col w-full h-full">
      <Tabs
        defaultValue="1"
        className="flex flex-col w-full h-full bg-background"
      >
        <TabsList>
          <TabsTrigger value="0">Inputs</TabsTrigger>
          <TabsTrigger value="1">Outputs</TabsTrigger>
        </TabsList>
        <TabsContent value="0">
          <ShaderInputEdit />
        </TabsContent>
        <TabsContent value="1">
          <Tabs defaultValue="Image" className="">
            <div className="flex flex-row gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-9 inline-flex items-center justify-center ">
                    <Plus className="" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Add Shader Output</DropdownMenuLabel>
                  {shaderOutputNames.map((name) =>
                    hasBuffer(name) ? null : (
                      <DropdownMenuItem
                        onClick={() => handleAddShaderOutput(name)}
                        key={name}
                      >
                        {name}
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <TabsList>
                {shaderDataRef.current.shader_outputs.map((output, idx) => (
                  <TabsTrigger
                    value={output.name}
                    onClick={() => setRenderPassEditIdx(idx)}
                    key={output.name}
                  >
                    {output.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {shaderDataRef.current.shader_outputs.map((output, idx) => (
              <TabsContent
                forceMount={true}
                value={output.name}
                key={output.name}
                className={cn(
                  renderPassEditIdx === idx ? "" : "hidden",
                  "bg-background m-0",
                )}
              >
                <Editor2
                  errMsgs={!errMsgs ? null : errMsgs.get(output.name)}
                  name={output.name}
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
