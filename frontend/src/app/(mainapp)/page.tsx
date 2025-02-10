import ShaderEditor from "@/app/(mainapp)/view/components/editor/ShaderEditor";
import { RendererProvider } from "@/context/RendererContext";

export default function Home() {
  return (
    <RendererProvider>
      <ShaderEditor />
    </RendererProvider>
  );
}
