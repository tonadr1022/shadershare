"use client";
import { createShaderWithPreview } from "@/api/shader-api";
import { getPreviewImgFile } from "@/app/(mainapp)/view/components/renderer/Renderer";
import { toastAxiosErrors } from "@/lib/utils";
import { AccessLevel, ShaderData } from "@/types/shader";
import {
  getShadertoyShaders,
  shaderToyToShader,
} from "@/utils/shadertoy-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import React, { useCallback } from "react";
import Dropzone, { DropzoneState } from "shadcn-dropzone";
import { toast } from "sonner";

const ImportFromShadertoy = () => {
  const queryClient = useQueryClient();
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
    },
  });
  const addTestShader = useCallback(
    async (shader: ShaderData) => {
      const previewFile = await getPreviewImgFile(shader);
      if (!previewFile) {
        toast.error("failed to generate preview file, cannot create shader");
        return;
      }
      createShaderMut.mutate({
        data: {
          title: shader.shader.title,
          description: shader.shader.description,
          access_level: AccessLevel.PRIVATE,
          shader_outputs: shader.shader_outputs,
        },
        previewFile: previewFile,
      });
    },
    [createShaderMut],
  );

  const handleUpload = useCallback(
    async (acceptedFiles: File[]) => {
      const { shaders: shaderToyShaders, errors } =
        await getShadertoyShaders(acceptedFiles);
      for (const err of errors) {
        console.error(err);
        toast.error(err);
      }
      const newShaders = [];
      for (const stShader of shaderToyShaders) {
        const { shader, errors } = shaderToyToShader(stShader);
        if (!shader || errors.length) {
          for (const err of errors) {
            console.error(err);
            toast.error(err);
          }
        } else {
          newShaders.push(shader);
        }
      }
      for (const shader of newShaders) {
        await addTestShader(shader);
      }
      console.log(newShaders);
    },
    [addTestShader],
  );

  return (
    <div className="h-24">
      <Dropzone onDrop={handleUpload}>
        {(dropzone: DropzoneState) => (
          <div className="h-24 flex flex-col justify-center" id="test">
            {dropzone.isDragAccept ? (
              <h6 className="">Drop Here</h6>
            ) : (
              <div className="flex items-center flex-col gap-1.5">
                <h6>Drop or Click to Upload and Import Shadertoy JSON files</h6>
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default ImportFromShadertoy;
