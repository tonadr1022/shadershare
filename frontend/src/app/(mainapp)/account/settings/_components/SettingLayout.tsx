import React from "react";

type EditorSettingProps = {
  id: string;
  labelText: string;
  children: React.ReactNode;
};
const SettingLayout = ({ id, children, labelText }: EditorSettingProps) => {
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
export default SettingLayout;
