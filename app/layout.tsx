import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Mentor Mate",
  description:
    "Streamline your project feedback process with our intuitive platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mentor Mate",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Apple Touch Icon - Specify the correct size */}
        <link rel="apple-touch-icon" href="/mentormate.png" sizes="180x180" />
        {/* Add additional icon sizes for better compatibility */}
        <link rel="apple-touch-icon" href="/mentormate-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/mentormate-512x512.png" sizes="512x512" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
