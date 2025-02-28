import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to your hackathon dashboard. Here&apos;s an overview of your progress and upcoming tasks.</p>
      </CardContent>
    </Card>
  )
}

