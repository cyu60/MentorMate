import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About TreeHacks 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            TreeHacks is Stanford's premier hackathon. Join us for 36 hours of learning, building, and innovating with
            fellow hackers from around the world.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-24 text-sm text-gray-500">Feb 16</div>
              <div>
                <div className="font-medium">Hackathon Starts</div>
                <div className="text-sm text-gray-600">Opening ceremony and team formation</div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-24 text-sm text-gray-500">Feb 18</div>
              <div>
                <div className="font-medium">Project Submission</div>
                <div className="text-sm text-gray-600">Submit your projects by 12 PM PST</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-medium">Grand Prize</div>
              <div className="text-sm text-gray-600">$10,000</div>
            </div>
            <div>
              <div className="font-medium">Runner Up</div>
              <div className="text-sm text-gray-600">$5,000</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

