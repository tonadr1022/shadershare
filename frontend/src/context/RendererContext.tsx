"use client";
import {
  createRenderer,
  IRenderer,
} from "@/app/(mainapp)/view/components/renderer/Renderer";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface RendererContextType {
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  renderer: IRenderer | null;
}

const RendererContext = createContext<RendererContextType | undefined>(
  undefined,
);

interface RendererProviderProps {
  children: ReactNode;
}

export const RendererProvider: React.FC<RendererProviderProps> = ({
  children,
}) => {
  const [paused, setPaused] = useState<boolean>(false);
  const [renderer] = useState<IRenderer>(createRenderer());

  return (
    <RendererContext.Provider value={{ paused, setPaused, renderer }}>
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
