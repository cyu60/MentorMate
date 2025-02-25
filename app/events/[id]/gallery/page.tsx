import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const projects = [
  {
    id: 1,
    title: "EcoTrack",
    description: "A mobile app that helps users track and reduce their carbon footprint.",
    image: "/placeholder.svg?text=EcoTrack",
    tags: ["Mobile", "Environment", "React Native"],
  },
  {
    id: 2,
    title: "MediConnect",
    description: "An AI-powered platform connecting patients with suitable clinical trials.",
    image: "/placeholder.svg?text=MediConnect",
    tags: ["AI", "Healthcare", "Web"],
  },
  {
    id: 3,
    title: "LearnLingo",
    description: "An interactive language learning game using AR technology.",
    image: "/placeholder.svg?text=LearnLingo",
    tags: ["AR", "Education", "Mobile"],
  },
]

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

