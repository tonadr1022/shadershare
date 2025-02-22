import React from "react";
import EditIChannel from "./EditIChannel";
import { useRendererCtx } from "@/context/RendererContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddShaderInputDialog from "./AddShaderInputDialog";
import { BufferName } from "@/types/shader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  bufferName: BufferName;
};

const ShaderInputEdit = ({ bufferName }: Props) => {
  const [editIdx, setEditIdx] = React.useState("0");
  const [, forceUpdate] = React.useState(0);
  const { shaderDataRef } = useRendererCtx();
  // TODO: convert to json object on fetch so don't need array search
  const output = shaderDataRef.current.shader_outputs.find(
    (out) => out.name === bufferName,
  );

  if (!output) {
    return <div>no output D:</div>;
  }
  const hasInputs = output.shader_inputs && output.shader_inputs.length;
  return (
    <Tabs
      defaultValue="0"
      orientation="vertical"
      value={editIdx}
      onValueChange={setEditIdx}
    >
      <div className="flex gap-2">
        {hasInputs ? (
          <TabsList>
            {output.shader_inputs?.map((input, idx) => {
              return (
                <TabsTrigger
                  value={idx.toString()}
                  onClick={() => setEditIdx(idx.toString())}
                  key={input.id || idx}
                >
                  {idx}
                </TabsTrigger>
              );
            })}
          </TabsList>
        ) : (
          <></>
        )}
        <AddShaderInputDialog
          bufferName={bufferName}
          onSave={(idx) => {
            setEditIdx(idx.toString());
            forceUpdate((prev) => prev + 1);
          }}
        >
          <Button variant="secondary">
            <Plus />
          </Button>
        </AddShaderInputDialog>
      </div>
      {hasInputs ? (
        output.shader_inputs?.map((input, idx) => {
          return (
            <TabsContent key={idx} value={idx.toString()}>
              <EditIChannel
                onDelete={() => {
                  setEditIdx("0");
                  forceUpdate((prev) => prev + 1);
                }}
                idx={input.idx}
                key={input.id || idx}
                input={input}
                bufferName={output.name as BufferName}
              />
            </TabsContent>
          );
        })
      ) : (
        <></>
      )}
    </Tabs>
  );
};

export default ShaderInputEdit;
