"use client";
import {
  createRenderer,
  IRenderer,
} from "@/app/(mainapp)/view/components/renderer/Renderer";
import { DefaultNewShader } from "@/rendering/example-shaders";
import { ShaderData } from "@/types/shader";
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
  shaderDataRef: React.RefObject<ShaderData>;
}

const RendererContext = createContext<RendererContextType | undefined>(
  undefined,
);

interface RendererProviderProps {
  initialShaderData?: ShaderData;
  children: ReactNode;
}

export const RendererProvider: React.FC<RendererProviderProps> = ({
  initialShaderData,
  children,
}) => {
  const [paused, setPaused] = useState<boolean>(false);
  const [renderer, setRenderer] = useState<IRenderer | null>(null);
  const initialized = useRef(false);
  const shaderDataRef = React.useRef<ShaderData>(
    initialShaderData || DefaultNewShader,
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setRenderer(createRenderer());
    return () => {
      renderer?.shutdown();
    };
  }, [renderer]);

  return (
    <RendererContext.Provider
      value={{ paused, setPaused, renderer, shaderDataRef }}
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
