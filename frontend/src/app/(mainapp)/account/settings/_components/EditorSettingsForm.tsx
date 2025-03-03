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
import SettingLayout from "./SettingLayout";

const SettingLayoutsForm = () => {
  const { localSettings, setLocalSettings } = useLocalSettings();
  return (
    <div className="flex flex-col gap-4">
      <SettingLayout id="relativeLineNumbers" labelText="Relative Line Numbers">
        <Switch
          id="relativeLineNumbers"
          onCheckedChange={(checked: CheckedState) => {
            setLocalSettings({
              ...localSettings,
              editor: {
                ...localSettings.editor,
                relativeLineNumbers: checked as boolean,
              },
            });
          }}
          checked={localSettings.editor.relativeLineNumbers}
        />
      </SettingLayout>
      <SettingLayout id="keyBindingMode" labelText="Key Binding Mode">
        <Select
          defaultValue={localSettings.editor.keyBindingMode.toString()}
          onValueChange={(value) => {
            setLocalSettings({
              ...localSettings,
              editor: {
                ...localSettings.editor,
                keyBindingMode: value as KeyBindingMode,
              },
            });
          }}
          value={localSettings.editor.keyBindingMode.toString()}
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
      </SettingLayout>
      <SettingLayout id="tabSize" labelText="Tab Size">
        <Select
          defaultValue={localSettings.editor.tabSize.toString()}
          onValueChange={(value) => {
            setLocalSettings({
              ...localSettings,
              editor: {
                ...localSettings.editor,
                tabSize: Number.parseInt(value),
              },
            });
          }}
          value={localSettings.editor.tabSize.toString()}
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
      </SettingLayout>
    </div>
  );
};

export default SettingLayoutsForm;
