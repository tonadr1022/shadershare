import type { Route } from "./+types/home";
import ShaderRenderer from "~/components/renderer/ShaderRenderer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <ShaderRenderer />;
}
