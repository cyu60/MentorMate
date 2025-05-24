"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectProps {
  projectId: string;
}

export default function MyProjectGalleryRedirect({ projectId }: RedirectProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new unified project route
    router.replace(`/projects/${projectId}`);
  }, [projectId, router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to new project page...</p>
      </div>
    </div>
  );
}