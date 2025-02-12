import React from "react";
import ShaderEditor from "../../../components/ShaderEditor";

const NewShaderPage = () => {
  return (
    <div className="p-4">
      <ShaderEditor editable={true} />
    </div>
  );
};

export default NewShaderPage;
