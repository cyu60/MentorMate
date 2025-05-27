import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/utils/Providers";
import { AuthProvider } from "@/features/user/authentication/auth/AuthProvider";
import { StagewiseToolbarWrapper } from "@/components/StagewiseToolbarWrapper";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";

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
          <ConditionalNavbar />
          <div className="min-h-screen flex flex-col">
            <div className="flex flex-1 pt-16">
              <AuthProvider>
                <main className="flex-1 flex flex-col">
                  <div className="flex-1">
                    {process.env.NODE_ENV === "development" && (
                      <StagewiseToolbarWrapper />
                    )}
                    {children}
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
