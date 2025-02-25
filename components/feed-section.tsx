import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const feedItems = [
  {
    id: 1,
    user: {
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AJ",
    },
    timestamp: "2 hours ago",
    content:
      'Just submitted my project "EcoTrack" for the Sustainability Challenge! Excited to see what everyone thinks.',
    type: "project_submission",
  },
  {
    id: 2,
    user: {
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "BS",
    },
    timestamp: "4 hours ago",
    content:
      "Made a breakthrough in our AI model for predicting crop yields. Can't wait to demo this at the hackathon!",
    type: "journal_entry",
  },
  {
    id: 3,
    user: {
      name: "Charlie Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "CD",
    },
    timestamp: "Yesterday",
    content: "Looking for team members skilled in React and Node.js for our healthcare app. DM if interested!",
    type: "team_request",
  },
]

export default function FeedSection() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {feedItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={item.user.avatar} alt={item.user.name} />
                <AvatarFallback>{item.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{item.user.name}</h4>
                  <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                </div>
                <p>{item.content}</p>
                {item.type === "project_submission" && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Project Submission
                  </span>
                )}
                {item.type === "journal_entry" && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Journal Entry
                  </span>
                )}
                {item.type === "team_request" && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Team Request
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

