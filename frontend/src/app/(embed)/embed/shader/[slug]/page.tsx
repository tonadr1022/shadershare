import ShaderRendererEmbed from "./_components/ShaderRendererEmbed";

const ShaderEmbed = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug: shaderId } = await params;
  return <ShaderRendererEmbed shaderId={shaderId} />;
};

export default ShaderEmbed;
