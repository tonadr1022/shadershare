import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
type Props = {
  type: string;
  onChange: (val: string) => void;
};

const ShaderInputTypeSelect = ({ type, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-2 w-40">
      <Label htmlFor="type-select">Type</Label>
      <Select
        defaultValue={type}
        onValueChange={(value) => {
          onChange(value);
          // if type was texture need to cleanup
        }}
      >
        <SelectTrigger>
          <SelectValue id="type-select" />
        </SelectTrigger>
        <SelectContent defaultValue={type}>
          <SelectItem value="texture">Texture</SelectItem>
          <SelectItem value="buffer">Buffer</SelectItem>
          <SelectItem value="keyboard">Keyboard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ShaderInputTypeSelect;
