import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={cn("bg-primary-foreground py-6 text-center mt-12")}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 px-12">
        <div className="flex space-x-4">
          <a
            href="https://github.com/tonadr1022/shadershare"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaGithub className="w-full h-full" />
          </a>
        </div>

        <p className="text-sm text-center md:text-left">
          © {new Date().getFullYear()} ShaderShare. Built with{" "}
          <a
            href="https://neovim.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 hover:underline"
          >
            Neovim
          </a>{" "}
          (btw)
        </p>

        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-gray-400">
            Terms & Privacy
          </Link>
          <Link href="/about" className="hover:text-gray-400">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
