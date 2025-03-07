"use client";
import {
  bulkCreateShaderWithPreview,
  createShaderWithPreview,
  ShaderFullUpload,
} from "@/api/shader-api";
import { getPreviewImgFile } from "@/app/(mainapp)/view/components/renderer/Renderer";
import { toastAxiosErrors } from "@/lib/utils";
import {
  AccessLevel,
  ShaderToyShaderResp,
  ShaderUpdateCreatePayload,
} from "@/types/shader";
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
import axios, { AxiosError } from "axios";
import { Spinner } from "./ui/spinner";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ImportFromShadertoy = () => {
  const [accessLevel, setAccessLevel] = useState(AccessLevel.PRIVATE);
  const [addShaderPending, setAddShaderPending] = useState(false);
  const queryClient = useQueryClient();
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: (err) => {
      toastAxiosErrors(err as AxiosError);
      setAddShaderPending(false);
    },
    onSuccess: () => {
      setAddShaderPending(false);
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
      toast.success(`Imported shader successfully`);
    },
  });
  const bulkCreateShaderMut = useMutation({
    mutationFn: bulkCreateShaderWithPreview,
    onError: (err) => {
      toastAxiosErrors(err as AxiosError);
      setAddShaderPending(false);
    },
    onSuccess: (res) => {
      setAddShaderPending(false);
      toast.success(`Imported ${res.ids.length} shaders.`);
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
    },
  });

  const addShader = useCallback(
    async (shader: ShaderUpdateCreatePayload) => {
      const previewFile = await getPreviewImgFile(shader);
      if (!previewFile) {
        return;
      }
      createShaderMut.mutate({
        shader: {
          flags: shader.flags,
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

  const handleUploadFiles = useCallback(
    async (acceptedFiles: File[]) => {
      const newErrs: string[] = [];
      setAddShaderPending(true);
      const { shaders: shaderToyShaders, errors } =
        await getShadertoyShaders(acceptedFiles);
      for (const e of errors) {
        newErrs.push(e);
      }
      const newShaders = [];
      for (const stShader of shaderToyShaders) {
        const { shader, errors } = shaderToyToShader(stShader, accessLevel);
        if (!shader || errors.length) {
          for (const err of errors) {
            newErrs.push(`${shader?.title || ""} ${err}`);
          }
        }
        newShaders.push(shader);
      }
      const uploads: ShaderFullUpload[] = [];
      for (const shader of newShaders) {
        const previewFile = await getPreviewImgFile(shader);
        if (!previewFile) {
          newErrs.push(
            `${shader?.title || ""}: Failed to render preview image`,
          );
          continue;
        }
        uploads.push({ shader, previewFile });
      }
      if (uploads.length) {
        bulkCreateShaderMut.mutate(uploads);
      } else {
        setAddShaderPending(false);
      }
      if (newErrs.length) {
        setAddShaderPending(false);
        setErrors(newErrs);
      } else {
        setErrors([]);
      }
    },
    [bulkCreateShaderMut, accessLevel],
  );
  const addShaderByIdMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.get(
        `https://www.shadertoy.com/api/v1/shaders/${id}?key=rdHlhm`,
      );
      return res.data;
    },
    onSuccess: async (data: ShaderToyShaderResp) => {
      const { shader, errors } = shaderToyToShader(data.Shader, accessLevel);
      if (!shader || errors.length) {
        for (const err of errors) {
          setErrors((existing) => [...existing, err]);
        }
      }
      if (shader) {
        try {
          await addShader(shader);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          toast.error(`Failed to upload "${shader.title}"`);
        } finally {
          setAddShaderPending(false);
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="access-level-select">Access Level</Label>
        <Select
          onValueChange={(val) => setAccessLevel(parseInt(val))}
          value={accessLevel.toString()}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent id="access-level-select">
            <SelectGroup>
              <SelectItem value={AccessLevel.PRIVATE.toString()}>
                Private
              </SelectItem>
              <SelectItem value={AccessLevel.PUBLIC.toString()}>
                Public
              </SelectItem>
              <SelectItem value={AccessLevel.UNLISTED.toString()}>
                Unlisted
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Dropzone onDrop={handleUploadFiles}>
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
      <InputButton
        onClick={(id: string) => {
          setAddShaderPending(true);
          addShaderByIdMut.mutate(id);
        }}
      />
      {addShaderPending ? <Spinner /> : <></>}
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
