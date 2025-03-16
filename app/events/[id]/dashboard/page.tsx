"use client";

import { useParams } from "next/navigation";
import DashboardContent from '@/components/dashboard/dashboard-content';

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-8">
      <DashboardContent eventId={id} />
    </div>
  );
}