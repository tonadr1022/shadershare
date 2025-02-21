"use client";
import { useParams } from "next/navigation";
import ShaderRendererEmbed from "./_components/ShaderRendererEmbed";

const ShaderEmbed = () => {
  const params = useParams();
  const { slug: shaderId } = params;
  if (!shaderId) return <p>No shader found</p>;
  return <ShaderRendererEmbed shaderId={shaderId as string} />;
};

export default ShaderEmbed;
