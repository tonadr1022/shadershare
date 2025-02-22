"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getShaderOutput, useRendererCtx } from "@/context/RendererContext";
import {
  BufferName,
  BufferProps,
  DefaultBufferProps,
  DefaultShaderInputTexture,
  FilterMode,
  ShaderInput,
  ShaderInputType,
  TextureProps,
  TextureWrap,
} from "@/types/shader";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { RefreshCw, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ShaderInputTypeSelect from "./ShaderInputTypeSelect";
import { useMutation } from "@tanstack/react-query";
import { deleteShaderInput } from "@/api/shader-api";
import { toast } from "sonner";

type Props = {
  input: ShaderInput;
  idx: number;
  bufferName: BufferName;
  onDelete: () => void;
};

const EditIChannel = ({ input, idx, bufferName, onDelete }: Props) => {
  const [previewimgUrl, setPreviewImgUrl] = useState(input.url || "");
  const { shaderDataRef, setShaderDataDirty, renderer } = useRendererCtx();
  const [, forceUpdate] = React.useState(false);
  const onTypeSelectChange = useCallback(
    (val: string) => {
      if (val == input.type || !renderer) return;
      input.dirty = true;
      renderer?.removeIChannel(bufferName, input.type, input.idx);

      input.type = val as ShaderInputType;

      if (input.type === "texture") {
        input.properties = DefaultShaderInputTexture.properties;
        input.url = DefaultShaderInputTexture.url;
        renderer.addImageIChannel(
          input.url!,
          bufferName,
          input.idx,
          input.properties as TextureProps,
        );
        setPreviewImgUrl(input.url!);
      } else {
        input.properties = DefaultBufferProps;
        input.url = "";
        renderer.addBufferIChannel(bufferName, bufferName, input.idx);
      }
      forceUpdate((prev) => !prev);
    },
    [bufferName, input, renderer],
  );

  const afterDeleteShaderInput = useCallback(() => {
    if (!renderer) return;
    renderer.removeIChannel(bufferName, input.type, input.idx);
    getShaderOutput(shaderDataRef, bufferName)?.shader_inputs?.splice(idx, 1);
    onDelete();
  }, [bufferName, idx, input, onDelete, renderer, shaderDataRef]);

  const deleteShaderInputMut = useMutation({
    mutationFn: deleteShaderInput,
    onSuccess: () => {
      afterDeleteShaderInput();
      toast.success("Input deleted");
    },
  });

  const handleDelete = useCallback(() => {
    if (input.id) {
      deleteShaderInputMut.mutate(input.id);
    } else {
      afterDeleteShaderInput();
    }
  }, [input.id, deleteShaderInputMut, afterDeleteShaderInput]);

  return (
    <div className="flex flex-col gap-4 " key={input.id || idx}>
      <h4>
        {input.type === "texture" ? "Texture" : "Buffer"} - iChannel{input.idx}
      </h4>
      <ShaderInputTypeSelect type={input.type} onChange={onTypeSelectChange} />
      {input.type === "texture" ? (
        <>
          <div className="flex flex-col gap-4 w-fit">
            <div className="flex flex-row w-80">
              <Input
                value={input.url}
                onChange={(e) => {
                  input.url = e.target.value;
                  setShaderDataDirty(true);
                  forceUpdate((prev) => !prev);
                }}
              />
              <Button
                onClick={async () => {
                  if (!renderer || !input.url) return;
                  setPreviewImgUrl(input.url);
                  await renderer.setTextureData(bufferName, idx, input.url);
                  input.dirty = true;
                }}
                disabled={!input.url}
              >
                <RefreshCw />
              </Button>
            </div>
            {previewimgUrl && (
              <Image
                width={100}
                height={100}
                className="self-center"
                src={previewimgUrl}
                alt="input texture"
              />
            )}
          </div>
          <div className="flex flex-col gap-2 w-40">
            <Label htmlFor="tex-filter">Filter</Label>
            <Select
              defaultValue={(input.properties as TextureProps).filter}
              onValueChange={(value) => {
                input.dirty = true;
                const filter = value as FilterMode;
                if (input.properties) {
                  (input.properties as TextureProps).filter = filter;
                }
                if (renderer) {
                  renderer.setTextureFilter(bufferName, idx, filter);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue id="tex-filter" />
              </SelectTrigger>
              <SelectContent
                defaultValue={(input.properties as TextureProps).filter}
              >
                <SelectItem value="nearest">Nearest</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-40 max-w-sm">
            <Label htmlFor="tex-wrap">Texture Wrap</Label>
            <Select
              defaultValue={(input.properties as TextureProps).wrap}
              onValueChange={(value) => {
                input.dirty = true;
                const wrap = value as TextureWrap;
                if (input.properties) {
                  (input.properties as TextureProps).wrap = wrap;
                }
                if (renderer) {
                  renderer.setTextureWrap(bufferName, idx, wrap);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue id="tex-wrap" />
              </SelectTrigger>
              <SelectContent
                defaultValue={(input.properties as TextureProps).wrap}
              >
                <SelectItem value="repeat">Repeat</SelectItem>
                <SelectItem value="clamp">Clamp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2 w-40 max-w-sm">
            <Label htmlFor="buffer-name">Buffer</Label>
            <Select
              defaultValue={(input.properties as BufferProps).name}
              onValueChange={(value) => {
                input.dirty = true;
                const name = value as BufferName;
                if (input.properties) {
                  (input.properties as BufferProps).name = name;
                }
                if (renderer) {
                  renderer.setBufferIChannel(
                    bufferName,
                    (input.properties as BufferProps).name,
                    idx,
                  );
                }
              }}
            >
              <SelectTrigger>
                <SelectValue id="buffer-name" />
              </SelectTrigger>
              <SelectContent
                defaultValue={(input.properties as TextureProps).wrap}
              >
                <SelectItem value="Buffer A">Buffer A</SelectItem>
                <SelectItem value="Buffer B">Buffer B</SelectItem>
                <SelectItem value="Buffer C">Buffer C</SelectItem>
                <SelectItem value="Buffer D">Buffer D</SelectItem>
                <SelectItem value="Buffer E">Buffer E</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <Button
        onClick={handleDelete}
        variant="destructive"
        className=" h-12 w-12"
      >
        <Trash />
      </Button>
    </div>
  );
};

export default EditIChannel;
