import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MyProjectSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Project</h2>
        <Button className="bg-black text-white hover:bg-black/90">Submit My Project</Button>
      </div>
      <p className="text-gray-600 mb-6">Your project details and progress will be displayed here.</p>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Project Name</h3>
          <p>EcoTrack</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p>A mobile app that helps users track and reduce their carbon footprint through daily activities.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Members</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Alice Johnson (You)</li>
            <li>Bob Smith</li>
            <li>Charlie Davis</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

