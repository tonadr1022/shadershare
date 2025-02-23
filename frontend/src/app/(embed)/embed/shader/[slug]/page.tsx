import ShaderRendererEmbed from "./_components/ShaderRendererEmbed";

export const dynamic = "force-static";
export async function generateStaticParams() {
  return [];
}
const ShaderEmbed = () => {
  return <ShaderRendererEmbed />;
};

export default ShaderEmbed;
