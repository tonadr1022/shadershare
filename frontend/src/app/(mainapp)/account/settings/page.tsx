import LocalSettingsProvider from "@/context/LocalSettingsContext";
import EditorSettingsForm from "./_components/EditorSettingsForm";

const ProfileSettings = () => {
  return (
    <LocalSettingsProvider>
      <div className="flex flex-col gap-6">
        <h2>Settings</h2>
        <div className="flex flex-col gap-6">
          <h3>Editor Settings</h3>
          <EditorSettingsForm />
        </div>
      </div>
    </LocalSettingsProvider>
  );
};

export default ProfileSettings;
