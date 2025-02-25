import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const feedItems = [
  {
    id: 1,
    user: { name: "Alice Johnson", avatar: "/placeholder.svg" },
    content: 'Just submitted my project "EcoTrack" for the Sustainability Challenge!',
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: { name: "Bob Smith", avatar: "/placeholder.svg" },
    content: "Looking for a frontend developer to join our team. We're working on an AI-powered healthcare solution.",
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    user: { name: "Charlie Davis", avatar: "/placeholder.svg" },
    content: "Excited to announce that we've reached the MVP stage for our AR language learning app!",
    timestamp: "Yesterday",
  },
]

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Activity Feed</h2>
      {feedItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={item.user.avatar} />
                <AvatarFallback>{item.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">{item.user.name}</h3>
                <p className="text-gray-600">{item.content}</p>
                <p className="text-sm text-gray-500">{item.timestamp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

