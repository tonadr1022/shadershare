import LocalSettingsProvider from "@/context/LocalSettingsContext";
import EditorSettingsForm from "./_components/EditorSettingsForm";

const ProfileSettings = () => {
  return (
    <LocalSettingsProvider>
      <EditorSettingsForm />
    </LocalSettingsProvider>
  );
};

export default ProfileSettings;
