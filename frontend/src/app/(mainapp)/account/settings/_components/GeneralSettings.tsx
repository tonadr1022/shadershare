"use client";
import React from "react";
import SettingLayout from "./SettingLayout";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useLocalSettings } from "@/context/LocalSettingsContext";
import { Switch } from "@/components/ui/switch";

const GeneralSettings = () => {
  const { localSettings, setLocalSettings } = useLocalSettings();
  return (
    <SettingLayout id="shader-autoplay" labelText="Autoplay Shaders">
      <Switch
        id="relativeLineNumbers"
        onCheckedChange={(checked: CheckedState) => {
          setLocalSettings({
            ...localSettings,
            general: {
              ...localSettings.general,
              autoplayShaders: checked as boolean,
            },
          });
        }}
        checked={localSettings.general.autoplayShaders}
      />
    </SettingLayout>
  );
};

export default GeneralSettings;
