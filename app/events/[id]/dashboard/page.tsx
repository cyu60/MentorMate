import DashboardContent from "@/components/dashboard-content"

interface PageProps {
  params: { id: string }
}

export default async function DashboardPage({
  params,
}: PageProps) {
  const { id } = await Promise.resolve(params)

  return <DashboardContent eventId={id} />
}