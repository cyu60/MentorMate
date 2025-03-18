"use client";

import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "" }: LoadingScreenProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <div className="relative z-10 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
        {message && <p className="mt-4 text-blue-600 font-light">{message}</p>}
      </div>
    </div>
  );
}
