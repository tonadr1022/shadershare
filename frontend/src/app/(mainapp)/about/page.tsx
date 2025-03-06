import Link from "next/link";
import React from "react";

type SectionProps = {
  heading: string;
  children: React.ReactNode;
};
const Section = ({ heading, children }: SectionProps) => {
  return (
    <div className="flex flex-col bg-primary-foreground rounded-md p-4 w-full">
      <h3 className="pb-2">{heading}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};
const AboutPage = () => {
  return (
    <div className="terms-page flex flex-col items-center pt-8 gap-8 px-8 container mx-auto">
      <h1 className="text-center">About</h1>
      <div className="flex flex-col gap-4">
        <Section heading="What is this?">
          <p>
            Shadershare is a platform for sharing and discovering shaders,
            inspired by{" "}
            <Link
              className="text-blue-500 hover:underline"
              href="https://www.shadertoy.com"
              target="_blank"
              prefetch={false}
            >
              Shadertoy
            </Link>
            .
          </p>
          <p>
            Multi-pass shaders can be composed and edited in real-time, browsed
            by category, and shared with a unique URL. I built this app to
            replicate much of Shadertoy&apos;s functionality with the goal of
            improving performance while adding additional features. Vim-bindings
            in the editor was the initial motivation, which quickly led to a
            rapid attempt to shake off my web-dev rust after strictly graphics
            programming in C++ for 8 months.
          </p>
        </Section>
        <Section heading="What to do?">
          <p>
            Admittedly, the documentation is not fantastic at the moment, but
            the concept is similar to Shadertoy. You can create shaders, add
            them to playlists, and browse what other&apos;s have created. Search
            for shaders by title or tag, and get inspired!
          </p>
        </Section>
      </div>
    </div>
  );
};

export default AboutPage;
