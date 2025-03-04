import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MentorMate",
  description: "Connecting mentors and students in hackathons",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1 pt-16">
              <AuthProvider>
                <main className="flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-white to-blue-50/60">
                    <div className="flex-1">{children}</div>
                    <div className="mt-auto"> <Footer /></div>
                  </div>
                </main>
              </AuthProvider>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
