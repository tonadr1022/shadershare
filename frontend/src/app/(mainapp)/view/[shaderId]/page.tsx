import { RendererProvider } from "@/context/RendererContext";
import ShaderEditor from "../components/editor/ShaderEditor";

export default async function Home() {
  return (
    <>
      <RendererProvider>
        <ShaderEditor />
      </RendererProvider>
    </>
  );
}
