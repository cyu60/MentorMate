import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function RulesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hackathon Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">General Rules</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>All work must be completed during the hackathon</li>
            <li>Teams can have up to 4 members</li>
            <li>Projects must be original work</li>
            <li>Use of open source libraries and APIs is allowed</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Submission Requirements</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Project must be submitted before the deadline</li>
            <li>Include a demo video</li>
            <li>Provide access to source code</li>
            <li>Complete project documentation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

