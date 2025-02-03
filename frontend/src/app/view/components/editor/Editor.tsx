import React, { useCallback, useEffect, useMemo, useRef } from "react";
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
  renderer: IRenderer;
};

type EditorOptions = {
  fontSize: number;
  keyBinding: "vim";
  tabSize: 4;
  relativeLineNumber: true;
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

const Editor = (props: Props) => {
  const { initialValue, renderer } = props;

  const onCompileFunc = useCallback(
    (text: string): ErrMsg[] => {
      if (!renderer) return [];
      const res = renderer?.setShader(text);
      return renderer.getErrorMessages(res.message || "");
    },
    [renderer],
  );
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const codeRef = useRef<string>(initialValue);

  const onChange = useCallback((val: string) => {
    codeRef.current = val;
  }, []);

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
    Vim.defineEx("write", "w", onCompile);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCompile, handleKeyDown]);

  const extensions = useMemo(
    () => [
      cpp(),
      indentUnit.of("    "),
      vim({ status: true }),
      drawSelection({ cursorBlinkRate: 0 }),
      errorField,
    ],
    [],
  );
  return (
    <div className="flex flex-col">
      <CodeMirror
        ref={editorRef}
        value={initialValue}
        theme={"dark"}
        onChange={onChange}
        autoFocus={false}
        extensions={extensions}
      />
    </div>
  );
};

export default Editor;
