import React, { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror, {
  ReactCodeMirrorRef,
  StateEffect,
  StateField,
} from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { Vim, vim } from "@replit/codemirror-vim";
import { indentUnit } from "@codemirror/language";
import {
  Decoration,
  DecorationSet,
  drawSelection,
  EditorView,
} from "@codemirror/view";
import { ErrorWidget } from "./ErrorWidget";

type Props = {
  initialValue: string;
  onCompile: (text: string) => EmptyResult;
};

const errorEffect = StateEffect.define<{ line: number; message: string }>();
const errorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (decorations, transaction) => {
    decorations = decorations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(errorEffect)) {
        const linePos = transaction.state.doc.line(effect.value.line);
        const deco = Decoration.widget({
          widget: new ErrorWidget(effect.value.message),
          side: 1, // Place below the line
        }).range(linePos.to);
        return decorations.update({ add: [deco] });
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const Editor = (props: Props) => {
  const { initialValue, onCompile: onCompileFunc } = props;
  const [code, setCode] = useState(initialValue);
  const [error, setError] = useState("");
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const codeRef = useRef<string>(initialValue);

  const onChange = useCallback((val, viewUpdate) => {
    setCode(val);
    codeRef.current = val;
  }, []);

  const onCompile = useCallback(async () => {
    const result = onCompileFunc(codeRef.current);
    setError(result?.message || "");
    // const line = getLine(result?.message || "");
    const line = 5;
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: errorEffect.of({
          line,
          message: result.message || "no message",
        }),
      });
    }
  }, [onCompileFunc]);

  useEffect(() => {
    Vim.defineEx("write", "w", onCompile);
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus on Ctrl + E (Windows/Linux) or Cmd + E (macOS)
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
    };
    console.log("add event listener");
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCompile]);

  return (
    <div className="flex flex-col">
      <CodeMirror
        ref={editorRef}
        value={code}
        theme={"dark"}
        onChange={onChange}
        autoFocus={false}
        extensions={[
          cpp(),
          indentUnit.of("    "),
          vim(),
          drawSelection({ cursorBlinkRate: 0 }),
          errorField,
        ]}
      />
      <style>
        {`
          .error-line {
            background-color: rgba(255, 0, 0, 0.2);
          }
        `}
      </style>
      {error && <div>error: {error}</div>}
    </div>
  );
};

export default Editor;
