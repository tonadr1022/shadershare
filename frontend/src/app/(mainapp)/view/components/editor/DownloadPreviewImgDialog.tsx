"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ShaderData } from "@/types/shader";
import React, { useCallback, useState } from "react";
import { createRenderer, promptSaveScreenshot } from "../renderer/Renderer";
import { useRendererCtx } from "@/context/RendererContext";

// type Props = {
//   onSave: (width: number, height: number) => void;
// };

const heightFromWidth = (size: number) => {
  return (size * 9) / 16;
};

const promptSavePreviewImage = async (
  width: number,
  height: number,
  shaderData: ShaderData,
) => {
  const renderer = createRenderer();
  const canvas = document.createElement("canvas");
  renderer.initialize({
    canvas: canvas,
    shaderInputs: shaderData.shader_inputs,
    shaderOutputs: shaderData.shader_outputs,
  });
  renderer.onResize(width, height);
  for (let i = 0; i < 2; i++) {
    renderer.render({ checkResize: false, dt: 0.07 });
  }
  promptSaveScreenshot(canvas);
  renderer.shutdown();
};

const DEFAULT_WIDTH = 1600;
const DownloadPreviewImageDialog = () => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const { shaderDataRef } = useRendererCtx();
  const handleSave = useCallback(() => {
    promptSavePreviewImage(
      width,
      heightFromWidth(width),
      shaderDataRef.current,
    );
  }, [width, shaderDataRef]);

  const onClose = useCallback((open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setWidth(DEFAULT_WIDTH);
      }, 100);
    }
  }, []);

  return (
    <Dialog onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline">Save Preview Image</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={width}
            type="number"
            min={1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setWidth(parseInt(e.target.value) || 0)
            }
          />
          <Slider
            defaultValue={[width]}
            value={[width]}
            onValueChange={(value) => setWidth(value[0])}
            max={4000}
            min={1}
            step={10}
          />
        </div>
        <div>
          {width} x {heightFromWidth(width)}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadPreviewImageDialog;
