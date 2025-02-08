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
import { ErrorWidget } from "./ErrorWidget";
import { ErrMsg, IRenderer, ShaderData } from "@/types/shader";
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
  text: string;
  visible: boolean;
  idx: number;
  onCompile: (idx: number, editorRef: ReactCodeMirrorRef, text: string) => void;
  onTextChange: (text: string, idx: number) => void;
};
const getThemeString = (nextTheme: string) => {
  switch (nextTheme) {
    case "light":
      return "light";
    case "dark":
      return "dark";
    default:
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }
};

export const Editor2 = React.memo((props: Props2) => {
  const { theme } = useTheme();

  const { visible } = props;
  const { text, onTextChange, onCompile } = props;
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "e") {
        event.preventDefault();
        editorRef.current?.view?.focus();
      }

      if (event.key === "Enter" && event.altKey) {
        const editor = editorRef.current;
        if (onCompile && editor && editor.view) {
          const text = editor.view.state.doc.toString();
          onCompile(props.idx, editor, text);
        }
      }
      // TODO: setting for this
      // if (event.key === "Escape") {
      //   (document.activeElement as HTMLElement)?.blur();
      // }
    },
    [onCompile, props.idx],
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

  return (
    <CodeMirror
      ref={editorRef}
      value={text}
      theme={getThemeString(theme || "")}
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

  const onTextUpdate = useCallback((newText: string, idx: number) => {
    setShaderData((prevData) => ({
      ...prevData,
      render_passes: prevData.render_passes.map((renderPass, i) =>
        i === idx ? { ...renderPass, code: newText } : renderPass,
      ),
    }));
  }, []);

  const onBufferIdxChange = useCallback((idx: number) => {
    setRenderPassEditIdx(idx);
  }, []);

  const onCompileFunc = useCallback(
    (idx: number, text: string): ErrMsg[] => {
      if (!renderer) return [];
      const res = renderer?.setShader(idx, text);
      return renderer.getErrorMessages(res.message || "");
    },
    [renderer],
  );

  const onCompile = useCallback(
    async (idx: number, editorRef: ReactCodeMirrorRef, text: string) => {
      // clear existing errors
      const view = editorRef.view;
      if (!view) return;
      view.dispatch({ effects: clearErrorsEffect.of() });

      // compile
      const result = onCompileFunc(idx, text);
      if (result.length === 0) return;
      view.dispatch({
        effects: result.map((err) =>
          errorEffect.of({
            line: err.line,
            message: err.message || "",
          }),
        ),
      });
    },
    [onCompileFunc],
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
            key={renderPass.pass_idx}
            className={cn(
              renderPassEditIdx === idx ? "" : "hidden",
              "bg-white  m-0",
            )}
          >
            <Editor2
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

// const Editor = (props: Props) => {
//   const [shaderData, dispatch] = useReducer(editorReducer, initialShader);
//   const [renderPassEditIdx, setRenderPassEditIdx] = useState<number>(0);
//
//   const saveShaderMutation = useMutation({
//     mutationFn: async (data: ShaderData) => {
//       console.log("save shader", data);
//     },
//   });
//   const { renderer } = props;
//   const onCompileFunc = useCallback(
//     (shaderData: ShaderData): ErrMsg[] => {
//       if (!renderer) return [];
//       const res = renderer?.setShader(shaderData.render_passes[0].code);
//       console.log("compile", res);
//       return renderer.getErrorMessages(res.message || "");
//     },
//     [renderer],
//   );
//   const editorRef = useRef<ReactCodeMirrorRef | null>(null);
//
//   console.log("render");
//   // function debounce(func: any, wait: number) {
//   //   return function executedFunction(...args: unknown[]) {
//   //     const later = () => {
//   //       clearTimeout(timeout);
//   //       func(...args);
//   //     };
//   //     clearTimeout(timeout);
//   //     timeout = setTimeout(later, wait);
//   //   };
//   // }
//   const onChange = useCallback(
//     debounce((val: string) => {
//       const currentCode = shaderData.render_passes[renderPassEditIdx]?.code;
//       if (currentCode !== val) {
//         dispatch({
//           type: "SET_RENDER_PASS_CODE",
//           payload: { pass_idx: renderPassEditIdx, code: val },
//         });
//       }
//     }, 300), // Adjust debounce time as necessary
//     [renderPassEditIdx, shaderData],
//   );
//
//   // const onChange = useCallback(
//   //   (val: string) => {
//   //     dispatch({
//   //       type: "SET_RENDER_PASS_CODE",
//   //       payload: { pass_idx: renderPassEditIdx, code: val },
//   //     });
//   //   },
//   //   [renderPassEditIdx],
//   // );
//
//   const onCompile = useCallback(async () => {
//     // clear existing errors
//     const view = editorRef.current?.view;
//     if (!view) return;
//     view.dispatch({ effects: clearErrorsEffect.of() });
//
//     // compile
//     const result = onCompileFunc(shaderData);
//     if (result.length === 0) return;
//     view.dispatch({
//       effects: result.map((err) =>
//         errorEffect.of({
//           line: err.line,
//           message: err.message || "",
//         }),
//       ),
//     });
//   }, [onCompileFunc, shaderData]);
//
//   const handleKeyDown = useCallback(
//     (event: KeyboardEvent) => {
//       if ((event.ctrlKey || event.metaKey) && event.key === "e") {
//         event.preventDefault();
//         editorRef.current?.view?.focus();
//       }
//
//       if (event.key === "Escape") {
//         (document.activeElement as HTMLElement)?.blur();
//       }
//       if (event.key === "Enter" && event.altKey) {
//         onCompile();
//       }
//     },
//     [onCompile],
//   );
//
//   useEffect(() => {
//     // Vim.defineEx("write", "w", onCompile);
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onCompile, handleKeyDown]);
//
//   const extensions = useMemo(
//     () => [
//       cpp(),
//       indentUnit.of("    "),
//       vim({ status: false }),
//       drawSelection({ cursorBlinkRate: 0 }),
//       errorField,
//     ],
//     [],
//   );
//   return (
//     <div className="flex flex-col">
//       <div className="flex flex-col">
//         {shaderData.render_passes.map((renderPass, idx) => (
//           <Button
//             key={renderPass.pass_idx}
//             className={renderPassEditIdx === idx ? "active" : ""}
//             onClick={() => {
//               console.log("idx", idx);
//               setRenderPassEditIdx(idx);
//             }}
//           >
//             {idx}
//           </Button>
//         ))}
//       </div>
//       <Button
//         onClick={() => {
//           saveShaderMutation.mutate(shaderData);
//         }}
//       >
//         save
//       </Button>
//       <CodeMirror
//         ref={editorRef}
//         value={shaderData.render_passes[renderPassEditIdx].code}
//         theme={"dark"}
//         onChange={onChange}
//         autoFocus={false}
//         extensions={extensions}
//       />
//     </div>
//   );
// };

// export default Editor;
