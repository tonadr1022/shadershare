import ShaderEditor from "@/components/ShaderEditor";

export default function Home() {
  return (
    <div className="p-4">
      <ShaderEditor editable={true} />
    </div>
  );
}
