"use client";
import { Button } from "@/components/ui/button";
import { Examples } from "@/rendering/example-shaders";
import React from "react";
import { getPreviewImgFile } from "../renderer/Renderer";
import { createShaderWithPreview } from "@/api/shader-api";
import { AccessLevel } from "@/types/shader";
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
  const addTestShaders = async () => {
    for (const shader of Examples) {
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
    }
    setVal((parseInt(val) + 1).toString());
  };
  return (
    <div className="flex flex-row gap-8">
      <Input
        value={val}
        className="w-24"
        type="number"
        onChange={(e) => setVal(e.target.value)}
      />
      <Button onClick={addTestShaders}>add test shaders</Button>
    </div>
  );
};

export default AddTestShaders;
