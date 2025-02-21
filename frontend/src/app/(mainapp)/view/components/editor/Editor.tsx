"use client";

import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "@/components/ui/dialog";
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
import { lineNumbersRelative } from "@uiw/codemirror-extensions-line-numbers-relative";
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
import { Plus, Settings } from "lucide-react";
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
import { useLocalSettings } from "@/context/LocalSettingsContext";
import EditorSettingsForm from "@/app/(mainapp)/account/settings/_components/EditorSettingsForm";

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

const Editor = React.memo((props: Props2) => {
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

  const { localSettings: settings } = useLocalSettings();
  const extensions = useMemo(() => {
    const exts = [
      cpp(),
      indentUnit.of(" ".repeat(settings.tabSize)),
      drawSelection({ cursorBlinkRate: 0 }),
      errorField,
    ];
    if (settings.relativeLineNumbers) {
      exts.push(lineNumbersRelative);
    }
    if (settings.keyBindingMode === "vim") {
      exts.push(vim({ status: false }));
    }
    return exts;
  }, [settings]);

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
Editor.displayName = "Editor2";

export const MultiBufferEditor = React.memo(() => {
  const [editorHelpValue, setEditorHelpValue] = useState("keybinds");
  const [shaderOutputName, setShaderOutputName] = useState("Image");
  // const [renderPassEditIdx, setRenderPassEditIdx] = useState();
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
          <TabsTrigger value="2">Help</TabsTrigger>
        </TabsList>
        <TabsContent value="0">
          <ShaderInputEdit />
        </TabsContent>
        <TabsContent value="1">
          <Tabs
            defaultValue={shaderOutputName}
            onValueChange={(value) => setShaderOutputName(value)}
            className=""
          >
            <div className="flex flex-row gap-4 justify-between">
              <div className="flex gap-4">
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
                  {shaderDataRef.current.shader_outputs.map((output) => (
                    <TabsTrigger
                      value={output.name}
                      // onClick={() => setRenderPassEditIdx(idx)}
                      key={output.name}
                    >
                      {output.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Settings />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Editor</DialogTitle>
                  <DialogDescription>
                    Change editor settings here.
                  </DialogDescription>
                  <EditorSettingsForm />
                </DialogContent>
              </Dialog>
            </div>
            {shaderDataRef.current.shader_outputs.map((output) => (
              <TabsContent
                forceMount={true}
                value={output.name}
                key={output.name}
                className={cn(
                  shaderOutputName === output.name ? "" : "hidden",
                  "bg-background m-0",
                )}
              >
                <Editor
                  errMsgs={!errMsgs ? null : errMsgs.get(output.name)}
                  name={output.name}
                  visible={shaderOutputName === output.name}
                  text={output.code}
                  onTextChange={onTextUpdate}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
        <TabsContent value="2">
          <Tabs
            defaultValue={editorHelpValue}
            onValueChange={(value) => setEditorHelpValue(value)}
          >
            <TabsList>
              <TabsTrigger value="keybinds">Keybinds</TabsTrigger>
              <TabsTrigger value="shaders">Shaders</TabsTrigger>
            </TabsList>
            <TabsContent value="keybinds">
              <div className="flex flex-col gap-2 ">
                <h3 className="pb-4">Keybinds</h3>
                <ul className="list-disc pl-4">
                  {Object.entries(keyBindsMap).map(([action, keybind]) => (
                    <li key={action}>
                      <span className="font-bold">{keybind.name}:</span>{" "}
                      {keybind.alt ? "Alt + " : ""}
                      {keybind.key}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="shaders">
              <h3 className="pb-4">Shaders</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <h5 className="font-semibold">Buffers and iChannels</h5>
                  <p>
                    Buffers A-E allow you to read and write to textures that can
                    be read from in subsequent passes, as well as the final
                    image. Each is effectively its own render pass, running its
                    own shader. If a buffer is enabled, a corresponding input
                    should also be enabled so the final image or following
                    buffers can read from it.
                  </p>
                  <p>
                    A shader input can be sampled by index using{" "}
                    <code>iChannelX</code> with the corresponding sampler:
                  </p>
                  <pre className="bg-secondary p-2 rounded-md">
                    <code>
                      {`fragColor = vec4(texture(iChannel0, fragCoord / iResolution.xy).xyz, 1.0);`}
                    </code>
                  </pre>
                </div>

                <div>
                  <h5 className="font-semibold">mainImage Function</h5>
                  <p>
                    Use this function for buffers A-E and the final image
                    shader. You must set <code>fragColor</code> to a{" "}
                    <strong>vec4</strong>.
                  </p>
                  <pre className="bg-secondary p-2 rounded-md">
                    <code>
                      {`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = vec4(1.0);
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
});
MultiBufferEditor.displayName = "MultiBufferEditor";
