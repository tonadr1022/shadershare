import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
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
import { ErrorWidget } from "./ErrorWidget";
import { useMutation } from "@tanstack/react-query";
import { initialFragmentShaderText } from "../renderer/Renderer";
import { Button } from "@/components/ui/button";

type Props = {
  initialValue: string;
  renderer: IRenderer;
};

// type EditorOptions = {
//   fontSize: number;
//   keyBinding: "vim";
//   tabSize: 4;
//   relativeLineNumber: true;
// };

type RenderPass = {
  code: string;
  pass_idx: number;
};

type ShaderData = {
  title: string;
  description: string;
  render_passes: RenderPass[];
};

const editorReducer = (state: ShaderData, action: any): ShaderData => {
  switch (action.type) {
    case "SET_RENDER_PASS_CODE":
      return {
        ...state,
        render_passes: state.render_passes.map((renderPass, idx) =>
          idx === action.payload.pass_idx
            ? { ...renderPass, code: action.payload.code }
            : renderPass,
        ),
      };
    default:
      return state;
  }
};

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

const initialShader: ShaderData = {
  title: "",
  description: "",
  render_passes: [
    { pass_idx: 0, code: initialFragmentShaderText },
    { pass_idx: 1, code: "nothing here" },
  ],
};

const Editor = (props: Props) => {
  const [shaderData, dispatch] = useReducer(editorReducer, initialShader);
  const [renderPassEditIdx, setRenderPassEditIdx] = useState<number>(0);

  const saveShaderMutation = useMutation({
    mutationFn: async (data: ShaderData) => {
      console.log("save shader", data);
    },
  });
  const { renderer } = props;
  const onCompileFunc = useCallback(
    (text: string): ErrMsg[] => {
      if (!renderer) return [];
      const res = renderer?.setShader(text);
      return renderer.getErrorMessages(res.message || "");
    },
    [renderer],
  );
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const codeRef = useRef<string>(shaderData.render_passes[0].code);

  console.log("render");
  function debounce(func: any, wait: number) {
    let timeout: any;
    return function executedFunction(...args: any) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  const onChange = useCallback(
    debounce((val: string) => {
      const currentCode = shaderData.render_passes[renderPassEditIdx]?.code;
      if (currentCode !== val) {
        dispatch({
          type: "SET_RENDER_PASS_CODE",
          payload: { pass_idx: renderPassEditIdx, code: val },
        });
      }
    }, 300), // Adjust debounce time as necessary
    [renderPassEditIdx, shaderData],
  );

  // const onChange = useCallback(
  //   (val: string) => {
  //     dispatch({
  //       type: "SET_RENDER_PASS_CODE",
  //       payload: { pass_idx: renderPassEditIdx, code: val },
  //     });
  //   },
  //   [renderPassEditIdx],
  // );

  const onCompile = useCallback(async () => {
    // clear existing errors
    const view = editorRef.current?.view;
    if (!view) return;
    view.dispatch({ effects: clearErrorsEffect.of() });

    // compile
    const result = onCompileFunc(codeRef.current);
    if (result.length === 0) return;
    view.dispatch({
      effects: result.map((err) =>
        errorEffect.of({
          line: err.line,
          message: err.message || "",
        }),
      ),
    });
  }, [onCompileFunc]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "e") {
        event.preventDefault();
        editorRef.current?.view?.focus();
      }

      if (event.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      }
      if (event.key === "Enter" && event.altKey) {
        onCompile();
      }
    },
    [onCompile],
  );

  useEffect(() => {
    // Vim.defineEx("write", "w", onCompile);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCompile, handleKeyDown]);

  const extensions = useMemo(
    () => [
      cpp(),
      indentUnit.of("    "),
      vim({ status: false }),
      drawSelection({ cursorBlinkRate: 0 }),
      errorField,
    ],
    [],
  );
  return (
    <div className="flex flex-col">
      {shaderData.render_passes.map((renderPass, idx) => (
        <Button
          key={renderPass.pass_idx}
          className={renderPassEditIdx === idx ? "active" : ""}
          onClick={() => {
            console.log("idx", idx);
            setRenderPassEditIdx(idx);
            codeRef.current = renderPass.code;
            console.log("curr", codeRef.current);
          }}
        >
          {idx}
        </Button>
      ))}
      <Button
        onClick={() => {
          saveShaderMutation.mutate(shaderData);
        }}
      >
        save
      </Button>
      <CodeMirror
        ref={editorRef}
        value={shaderData.render_passes[renderPassEditIdx].code}
        theme={"dark"}
        onChange={onChange}
        autoFocus={false}
        extensions={extensions}
      />
    </div>
  );
};

export default Editor;
