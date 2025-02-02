import ShaderEditor from "@/components/editor/ShaderEditor";

export default async function Home({ params }) {
  const { shaderId } = await params;
  return (
    <>
      <ShaderEditor shaderId={shaderId} />
    </>
  );
}
