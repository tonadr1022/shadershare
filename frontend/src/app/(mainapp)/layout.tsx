import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../../components/providers/ThemeProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import Layout2 from "./Layout2";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000",
  ),
  title: "Shader Share",
  description: "Share and discover shaders",

  openGraph: {
    title: "Shader Share",
    description: "Share and discover shaders",
    images: "/logo.svg",
    url: "https://shader-share.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shader Share",
    description: "Share and discover shaders",
    images: "/logo.svg",
  },
  authors: [{ name: "Tony Adriansen", url: "https://tadriansen.dev" }],
  keywords: [
    "shader",
    "share",
    "shaders",
    "graphics",
    "programming",
    "share",
    "demoscene",
    "real time rendering",
  ],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <script */}
        {/*   src="https://unpkg.com/react-scan/dist/auto.global.js" */}
        {/*   async */}
        {/* ></script> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Layout2>{children}</Layout2>
          </ThemeProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
