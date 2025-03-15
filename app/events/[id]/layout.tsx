import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function HackathonLayout({
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-2 md:px-4 bg-gray-50 pt-8">
        <div className="py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
