import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "../../components/providers/ThemeProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import Navbar from "../../components/navbar/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shader Share",
  description: "Share and discover shaders",
  viewport: "width=device-width, initial-scale=1",
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
    "shaders",
    "graphics",
    "programming",
    "share",
    "demoscene",
    "real time rendering",
  ],
  themeColor: "#000000",
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
            <Toaster />
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
