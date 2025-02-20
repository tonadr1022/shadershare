"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  KeyBindingMode,
  useLocalSettings,
} from "@/context/LocalSettingsContext";
import { CheckedState } from "@radix-ui/react-checkbox";
import React from "react";

type EditorSettingProps = {
  id: string;
  labelText: string;
  children: React.ReactNode;
};
const EditorSetting = ({ id, children, labelText }: EditorSettingProps) => {
  return (
    <div className="flex justify-between w-full gap-2 h-6 items-center">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {labelText}
      </label>
      {children}
    </div>
  );
};

const EditorSettingsForm = () => {
  const { localSettings, setLocalSettings } = useLocalSettings();
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <EditorSetting id="relativeLineNumbers" labelText="Relative Line Numbers">
        <Switch
          id="relativeLineNumbers"
          onCheckedChange={(checked: CheckedState) => {
            setLocalSettings({
              ...localSettings,
              relativeLineNumbers: checked as boolean,
            });
          }}
          checked={localSettings.relativeLineNumbers}
        />
      </EditorSetting>
      <EditorSetting id="keyBindingMode" labelText="Key Binding Mode">
        <Select
          defaultValue={localSettings.keyBindingMode.toString()}
          onValueChange={(value) => {
            setLocalSettings({
              ...localSettings,
              keyBindingMode: value as KeyBindingMode,
            });
          }}
          value={localSettings.keyBindingMode.toString()}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"standard"}>Standard</SelectItem>
              <SelectItem value={"vim"}>Vim</SelectItem>
              <SelectItem value={"emacs"}>Emacs</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </EditorSetting>
      <EditorSetting id="tabSize" labelText="Tab Size">
        <Select
          defaultValue={localSettings.tabSize.toString()}
          onValueChange={(value) => {
            setLocalSettings({
              ...localSettings,
              tabSize: Number.parseInt(value),
            });
          }}
          value={localSettings.tabSize.toString()}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </EditorSetting>
    </div>
  );
};

export default EditorSettingsForm;
