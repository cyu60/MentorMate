"use client";

interface ErrorScreenProps {
  message?: string;
}

export function ErrorScreen({
  message = "An error occurred.",
}: ErrorScreenProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <div className="relative z-10 text-center">
        <p className="text-2xl text-blue-400 font-light">{message}</p>
      </div>
    </div>
  );
}
