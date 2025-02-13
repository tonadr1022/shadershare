"use client";
import { apiBaseURL } from "@/api/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const ProfileSettings = () => {
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("json", JSON.stringify({ test: "aatest" }));
      const res = await axios.post(
        `${apiBaseURL}/api/v1/upload-image`,
        formData,
      );
      toast.success("Image uploaded successfully" + JSON.stringify(res.data));
      return res.data;
    },
    onError: (error) => {
      console.error("Image upload failed:", error);
    },
  });

  return (
    <div>
      <h2>Test Image Upload</h2>
      <input
        type="file"
        id="fileInput"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await uploadImageMutation.mutateAsync(file);
          }
        }}
      />
      <button onClick={() => document.getElementById("fileInput")?.click()}>
        Upload Image
      </button>
    </div>
  );
};

export default ProfileSettings;
