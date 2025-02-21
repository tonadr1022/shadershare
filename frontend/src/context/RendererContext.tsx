"use client";
import {
  createRenderer,
  IRenderer,
} from "@/app/(mainapp)/view/components/renderer/Renderer";
import { DefaultNewShader } from "@/rendering/example-shaders";
import {
  ShaderDataWithUser,
  ShaderOutputName,
  shaderOutputNames,
} from "@/types/shader";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";

interface RendererContextType {
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  renderer: IRenderer | null;
  shaderDataRef: React.RefObject<ShaderDataWithUser>;
  codeDirtyRef: React.RefObject<Map<ShaderOutputName, boolean>>;
  shaderDataDirty: boolean;
  setShaderDataDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

const RendererContext = createContext<RendererContextType | undefined>(
  undefined,
);

interface RendererProviderProps {
  initialShaderData?: ShaderDataWithUser;
  username?: string;
  children: ReactNode;
}

export const RendererProvider: React.FC<RendererProviderProps> = ({
  initialShaderData,
  children,
}) => {
  const [paused, setPaused] = useState<boolean>(false);
  const [renderer, setRenderer] = useState<IRenderer | null>(null);
  const [shaderDataDirty, setShaderDataDirty] = useState<boolean>(false);
  const initialized = useRef(false);
  const shaderDataRef = React.useRef<ShaderDataWithUser>(
    initialShaderData || DefaultNewShader,
  );
  const codeDirtyRef = useRef<Map<ShaderOutputName, boolean>>(new Map());

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setRenderer(createRenderer());
    for (const name of shaderOutputNames) {
      codeDirtyRef.current.set(name, false);
    }

    shaderDataRef.current.shader_inputs.sort((a, b) => a.idx - b.idx);
    shaderDataRef.current.shader_outputs.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return () => {
      renderer?.shutdown();
    };
  }, [renderer]);

  return (
    <RendererContext.Provider
      value={{
        shaderDataDirty,
        setShaderDataDirty,
        codeDirtyRef,
        paused,
        setPaused,
        renderer,
        shaderDataRef,
      }}
    >
      {children}
    </RendererContext.Provider>
  );
};

export const useRendererCtx = (): RendererContextType => {
  const context = useContext(RendererContext);
  if (!context) {
    throw new Error("useRenderer must be used within a RendererProvider");
  }
  return context;
};
