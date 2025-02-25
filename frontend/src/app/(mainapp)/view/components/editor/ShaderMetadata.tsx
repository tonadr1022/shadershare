"use client";

import { ShaderData } from "@/types/shader";
import React from "react";

type Props = {
  shaderData: ShaderData;
};
const ShaderMetadata = ({ shaderData }: Props) => {
  return (
    <div>
      <h2>{shaderData.title}</h2>
      <p>{shaderData.description}</p>
    </div>
  );
};

export default ShaderMetadata;
