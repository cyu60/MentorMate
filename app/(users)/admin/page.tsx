"use client";

import { useState, useEffect } from "react";
import { ADMIN_USER_IDS } from "@/lib/config/constants";
import { supabase } from "@/lib/supabase";
import { AdminDashboard } from "@/features/user/dashboards/dashboard/admin-dashboard";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          setIsLoading(false);
          return;
        }

        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const hasAdminAccess = ADMIN_USER_IDS.includes(session.user.id);

        setIsAdmin(hasAdminAccess);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      )}
    </div>
  );
}
