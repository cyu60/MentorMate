"use client";

import { useParams } from "next/navigation";
import DashboardContent from "@/components/dashboard-content";

export default function DashboardPage() {
  const params = useParams()
  const id = params.id as string

  return <DashboardContent eventId={id} />
}