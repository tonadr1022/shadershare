"use client";
import { Button } from "@/components/ui/button";
import { Examples } from "@/rendering/example-shaders";
import React from "react";
import { getPreviewImgFile } from "../renderer/Renderer";
import { createShaderWithPreview } from "@/api/shader-api";
import { AccessLevel, ShaderData } from "@/types/shader";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastAxiosErrors } from "@/lib/utils";

const AddTestShaders = () => {
  const [val, setVal] = React.useState("0");

  const queryClient = useQueryClient();
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
    },
  });
  const addTestShader = async (shader: ShaderData) => {
    const previewFile = await getPreviewImgFile(shader);
    createShaderMut.mutate({
      data: {
        title: shader.shader.title + val,
        description: shader.shader.description,
        access_level: AccessLevel.PUBLIC,
        shader_inputs: shader.shader_inputs,
        shader_outputs: shader.shader_outputs,
      },
      previewFile: previewFile!,
    });
    setVal((parseInt(val) + 1).toString());
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-8">
        <Input
          value={val}
          className="w-24"
          type="number"
          onChange={(e) => setVal(e.target.value)}
        />
        <Button
          onClick={() => {
            for (const shader of Examples) {
              addTestShader(shader);
            }
          }}
        >
          add test shaders
        </Button>
      </div>
      <div className="flex flex-col">
        {Examples.map((shader) => (
          <Button
            key={shader.shader.title}
            onClick={() => addTestShader(shader)}
          >
            Add: {shader.shader.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AddTestShaders;
