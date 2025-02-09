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
import { Slider } from "@/components/ui/slider";
import React, { useState } from "react";

const DownloadPreviewImageDialog = () => {
  const [size, setSize] = useState(50);

  const handleSave = () => {
    const profileData = { size: size };
    console.log("Profile data:", profileData); // Here is where you would handle the saved data (e.g., send to an API)
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Save Preview Image</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Slider
            defaultValue={[size]}
            value={[size]}
            onValueChange={(value) => setSize(value[0])}
            max={100}
            step={1}
          />
        </div>
        <div>{size}</div>
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
