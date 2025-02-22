import { Boxes } from "lucide-react";
import MainPageShaders from "./_components/MainPageShaders";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  // TODO: fetch some popular shaders
  return (
    <div className="flex h-full items-center justify-center pt-4 w-full">
      <div className="flex flex-col items-center justify-center w-full">
        <Boxes className="h-20 w-20 text-gray-900 dark:text-white" />
        <h1>Shader Share</h1>
        <h4 className=" pt-10">Create, share, and browse shaders</h4>
        <br />
        <h4>
          Inspired by{" "}
          <Button
            asChild
            variant="link"
            className="text-xl font-semibold tracking-tight m-0 p-0"
          >
            <Link
              href="https://www.shadertoy.com"
              target="_blank"
              prefetch={false}
            >
              Shadertoy
            </Link>
          </Button>
        </h4>
        <br />
        <br />
        <br />
        <p>Here&apos;s a random shader...</p>
        <MainPageShaders />
      </div>
    </div>
  );
}
