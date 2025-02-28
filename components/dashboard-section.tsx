import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to your hackathon dashboard. Here's an overview of your progress and upcoming tasks.</p>
      </CardContent>
    </Card>
  )
}

