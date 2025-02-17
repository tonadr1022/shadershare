"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRendererCtx } from "@/context/RendererContext";
import {
  FilterMode,
  ShaderInput,
  ShaderInputType,
  TextureWrap,
} from "@/types/shader";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ShaderInputTypeSelect from "./ShaderInputTypeSelect";

type Props = {
  input: ShaderInput;
  idx: number;
};

const EditIChannel = ({ input, idx }: Props) => {
  const [previewimgUrl, setPreviewImgUrl] = useState(input.url || "");
  const { setShaderDataDirty, renderer } = useRendererCtx();
  const [, forceUpdate] = React.useState(false);
  const onTypeSelectChange = useCallback(
    (val: string) => {
      const oldType = input.type;
      if (oldType === "texture") {
        // cleanup
      }
      input.type = val as ShaderInputType;
      forceUpdate((prev) => !prev);
    },
    [input],
  );

  return (
    <div className="flex flex-col gap-4" key={input.name}>
      <h4>
        {input.name} - iChannel{input.idx}
      </h4>
      <ShaderInputTypeSelect type={input.type} onChange={onTypeSelectChange} />
      {input.type === "texture" ? (
        <>
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
                await renderer.setTextureData(idx, input.url);
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
          <div className="flex flex-col gap-2 w-40">
            <Label htmlFor="tex-filter">Filter</Label>
            <Select
              defaultValue={input.properties?.filter}
              onValueChange={(value) => {
                const filter = value as FilterMode;
                if (input.properties) {
                  input.properties.filter = filter;
                }
                if (renderer) {
                  renderer.setTextureFilter(idx, filter);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue id="tex-filter" />
              </SelectTrigger>
              <SelectContent defaultValue={input.properties?.filter}>
                <SelectItem value="nearest">Nearest</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-40 max-w-sm">
            <Label htmlFor="tex-wrap">Texture Wrap</Label>
            <Select
              defaultValue={input.properties?.wrap}
              onValueChange={(value) => {
                const wrap = value as TextureWrap;
                if (input.properties) {
                  input.properties.wrap = wrap;
                }
                if (renderer) {
                  renderer.setTextureWrap(idx, wrap);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue id="tex-wrap" />
              </SelectTrigger>
              <SelectContent defaultValue={input.properties?.wrap}>
                <SelectItem value="repeat">Repeat</SelectItem>
                <SelectItem value="clamp">Clamp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default EditIChannel;
