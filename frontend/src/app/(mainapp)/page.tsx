import { Boxes } from "lucide-react";

export default function Home() {
  // TODO: fetch some popular shaders
  return (
    <div className="flex h-full items-center justify-center pt-4">
      <div className="flex flex-col items-center justify-center">
        <Boxes className="h-20 w-20 text-gray-900 dark:text-white" />
        <h1>Shader Share</h1>
        <p className="text-primary">Create, share, and browse shaders</p>
      </div>
    </div>
  );
}
