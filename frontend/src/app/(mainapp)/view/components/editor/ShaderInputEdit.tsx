import React, { useCallback } from "react";
import EditIChannel from "./EditIChannel";
import { useRendererCtx } from "@/context/RendererContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddShaderInputDialog from "./AddShaderInputDialog";

const ShaderInputEdit = () => {
  const [, setEditIdx] = React.useState<number>(0);
  const { shaderDataRef } = useRendererCtx();
  return (
    <Tabs
      defaultValue="0"
      className="flex flex-col gap-4 items-start w-full"
      orientation="vertical"
    >
      <div className="flex flex-row gap-4">
        <TabsList>
          {shaderDataRef.current.shader_inputs.map((input, idx) => {
            return (
              <TabsTrigger
                value={idx.toString()}
                onClick={() => setEditIdx(idx)}
                key={input.name}
              >
                {input.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <AddShaderInputDialog />
      </div>
      {shaderDataRef.current.shader_inputs.map((input, idx) => {
        return (
          <TabsContent key={idx} value={idx.toString()}>
            <EditIChannel idx={input.idx} key={input.name} input={input} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default ShaderInputEdit;
