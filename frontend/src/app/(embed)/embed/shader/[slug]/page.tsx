import ShaderRendererEmbed from "./_components/ShaderRendererEmbed";

const ShaderEmbed = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return <ShaderRendererEmbed />;
};

export default ShaderEmbed;
