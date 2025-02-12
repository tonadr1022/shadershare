"use client";
import {
  createRenderer,
  IRenderer,
} from "@/app/(mainapp)/view/components/renderer/Renderer";
import { MultiPassRed } from "@/rendering/example-shaders";
import { ShaderData } from "@/types/shader";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface RendererContextType {
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  rendererRef: React.RefObject<IRenderer | null>;
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
  const rendererRef = React.useRef<IRenderer | null>(null);
  if (rendererRef.current === null) {
    rendererRef.current = createRenderer();
  }
  const shaderDataRef = React.useRef<ShaderData>(
    initialShaderData || MultiPassRed,
  );

  // useEffect(() => {
  //   return () => {
  //     if (rendererRef.current) {
  //       console.log("shutdown renderer");
  //       rendererRef.current.shutdown();
  //     }
  //   };
  // }, []);

  return (
    <RendererContext.Provider
      value={{ paused, setPaused, rendererRef, shaderDataRef }}
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
