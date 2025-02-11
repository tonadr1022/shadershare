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
import React, { useCallback, useState } from "react";

type Props = {
  onSave: (width: number, height: number) => void;
};

const heightFromWidth = (size: number) => {
  return (size * 9) / 16;
};

const DEFAULT_WIDTH = 1600;
const DownloadPreviewImageDialog = ({ onSave }: Props) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const handleSave = useCallback(() => {
    onSave(width, heightFromWidth(width));
  }, [width, onSave]);

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
