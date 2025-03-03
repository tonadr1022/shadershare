import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
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
            <main className="w-screen h-screen">{children}</main>
          </ThemeProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
