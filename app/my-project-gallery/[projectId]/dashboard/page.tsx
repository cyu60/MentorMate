"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default function MyProjectDashboardRedirect({ params }: Props) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const resolvedParams = await params;
      // Redirect to new unified project route dashboard
      router.replace(`/projects/${resolvedParams.projectId}`);
    };
    
    redirect();
  }, [params, router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to project dashboard...</p>
      </div>
    </div>
  );
}