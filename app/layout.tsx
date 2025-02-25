import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MentorMate",
  description: "Connecting mentors and students in hackathons",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen">
            <Navbar />
            <div className="flex pt-[72px]"> {/* Add padding-top to account for fixed navbar */}
              <Sidebar />
              <main className="flex-1 md:pl-64">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
