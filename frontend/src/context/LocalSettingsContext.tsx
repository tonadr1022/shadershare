"use client";
import React, { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "react-use";
export type KeyBindingMode = "vim" | "emacs" | "standard";
export type LocalSettings = {
  tabSize: number;
  keyBindingMode: KeyBindingMode;
  relativeLineNumbers: boolean;
};

const defaultLocalSettings: LocalSettings = {
  tabSize: 4,
  keyBindingMode: "standard",
  relativeLineNumbers: false,
};

type LocalSettingsContextType = {
  localSettings: LocalSettings;
  setLocalSettings: React.Dispatch<
    React.SetStateAction<LocalSettings | undefined>
  >;
};

const LocalSettingsContext = createContext<LocalSettingsContextType | null>(
  null,
);

export const LocalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [localSettings, setLocalSettings] = useLocalStorage<LocalSettings>(
    "localSettings",
    defaultLocalSettings,
  );

  useEffect(() => {
    localStorage.setItem("localSettings", JSON.stringify(localSettings));
  }, [localSettings]);

  return (
    <LocalSettingsContext.Provider
      value={{
        localSettings: localSettings || defaultLocalSettings,
        setLocalSettings,
      }}
    >
      {children}
    </LocalSettingsContext.Provider>
  );
};

export const useLocalSettings = (): LocalSettingsContextType => {
  const ctx = useContext(LocalSettingsContext);
  if (!ctx) {
    throw new Error(
      "useLocalSettings must be used within a LocalSettingsProvider",
    );
  }
  return ctx;
};

export default LocalSettingsProvider;
