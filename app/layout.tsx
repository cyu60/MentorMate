import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/utils/Providers";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StagewiseToolbarWrapper } from "@/components/StagewiseToolbarWrapper";

const inter = Inter({ subsets: ["latin"] });

const stagewiseConfig = {
  plugins: [],
  onRequest: async (request: { type: string; payload: any }) => {
    console.log("Received request:", request);
    return { success: true };
  },
};

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
            <div className="flex flex-1 pt-16">
              <AuthProvider>
                <main className="flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-white to-blue-50/60">
                    <div className="flex-1 bg-gray-50">
                      {/* <div className="max-w-7xl mx-auto w-full px-6 lg:px-10"> */}
                      {process.env.NODE_ENV === "development" && (
                        <StagewiseToolbarWrapper />
                      )}
                      {children}
                      {/* </div> */}
                    </div>
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
