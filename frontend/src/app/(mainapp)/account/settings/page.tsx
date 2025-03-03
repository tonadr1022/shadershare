import LocalSettingsProvider from "@/context/LocalSettingsContext";
import EditorSettingsForm from "./_components/EditorSettingsForm";
import GeneralSettings from "./_components/GeneralSettings";

const ProfileSettings = () => {
  return (
    <LocalSettingsProvider>
      <div className="flex flex-col gap-6 max-w-lg">
        <h2>Settings</h2>
        <div className="flex flex-col gap-6">
          <h3>General</h3>
          <GeneralSettings />
          <h3>Editor </h3>
          <EditorSettingsForm />
        </div>
      </div>
    </LocalSettingsProvider>
  );
};

export default ProfileSettings;
