"use client";
import { createShaderWithPreview } from "@/api/shader-api";
import { getPreviewImgFile } from "@/app/(mainapp)/view/components/renderer/Renderer";
import { toastAxiosErrors } from "@/lib/utils";
import { AccessLevel, ShaderData, ShaderToyShaderResp } from "@/types/shader";
import {
  getShadertoyShaders,
  shaderToyToShader,
} from "@/utils/shadertoy-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, X } from "lucide-react";

import React, { useCallback, useState } from "react";
import Dropzone, { DropzoneState } from "shadcn-dropzone";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";

const ImportFromShadertoy = () => {
  const queryClient = useQueryClient();
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
    },
  });
  const addShader = useCallback(
    async (shader: ShaderData) => {
      const previewFile = await getPreviewImgFile(shader);
      if (!previewFile) {
        return;
      }
      createShaderMut.mutate({
        data: {
          title: shader.title,
          description: shader.description,
          access_level:
            process.env.NODE_ENV === "development"
              ? AccessLevel.PUBLIC
              : AccessLevel.PRIVATE,
          shader_outputs: shader.shader_outputs,
        },
        previewFile: previewFile,
      });
    },
    [createShaderMut],
  );

  const [errors, setErrors] = React.useState<string[]>([]);
  const handleUpload = useCallback(
    async (acceptedFiles: File[]) => {
      const { shaders: shaderToyShaders, errors } =
        await getShadertoyShaders(acceptedFiles);
      setErrors((existing) => [...existing, ...errors]);
      const newShaders = [];
      for (const stShader of shaderToyShaders) {
        const { shader, errors } = shaderToyToShader(stShader);
        if (!shader || errors.length) {
          for (const err of errors) {
            setErrors((existing) => [...existing, err]);
          }
        } else {
          newShaders.push(shader);
        }
      }
      for (const shader of newShaders) {
        await addShader(shader);
      }
    },
    [addShader],
  );
  const getShaderMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.get(
        `https://www.shadertoy.com/api/v1/shaders/${id}?key=rdHlhm`,
      );
      console.log(res.status, "got");
      return res.data;
    },
    onSuccess: (data: ShaderToyShaderResp) => {
      const { shader, errors } = shaderToyToShader(data.Shader);
      if (!shader || errors.length) {
        for (const err of errors) {
          setErrors((existing) => [...existing, err]);
        }
      } else {
        try {
          addShader(shader);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          toast.error("Failed to upload shader.");
        }
      }
    },
    onError: (e) => {
      console.error(e, "err");
      toast.error("Shadertoy not found or not API accessible");
    },
  });

  return (
    <div className="flex flex-col gap-4 h-24">
      <Dropzone onDrop={handleUpload}>
        {(dropzone: DropzoneState) => (
          <div className="h-24 flex flex-col justify-center" id="test">
            {dropzone.isDragAccept ? (
              <h6 className="">Drop Here</h6>
            ) : (
              <div className="flex flex-col gap-1.5">
                <h6 className="flex gap-2 px-4">
                  Import Shadertoy JSON files <FileUp />
                </h6>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      <p className="self-center">
        <strong>OR</strong>
      </p>
      <InputButton onClick={getShaderMut.mutate} />
      <div>
        {errors.length ? (
          <>
            <h3 className="flex gap-2">
              Import Errors
              <Button variant="outline" onClick={() => setErrors([])}>
                <X />
              </Button>
            </h3>
            <div className="rounded-md p-2 flex flex-col gap-2">
              {errors.map((err, i) => (
                <p className="text-red-500" key={i}>
                  {err}
                </p>
              ))}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

function InputButton({ onClick }: { onClick: (val: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <p>
        Enter a public + API accessible Shadertoy ID (id found in url when
        viewing a shader on Shadertoy)
      </p>
      <div className="flex gap-2 w-fit">
        <Input
          id="import-by-id"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="abc123"
        />
        <Button onClick={() => onClick(val)}>Import</Button>
      </div>
    </div>
  );
}

export default ImportFromShadertoy;
