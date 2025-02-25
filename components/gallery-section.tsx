import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const projects = [
  {
    id: 1,
    title: "EcoTrack",
    description: "A mobile app that helps users track and reduce their carbon footprint through daily activities.",
    tags: ["Mobile", "React Native", "Sustainability"],
    author: "Alice Johnson",
    likes: 24,
  },
  {
    id: 2,
    title: "MediConnect",
    description:
      "An AI-powered platform connecting patients with suitable clinical trials based on their medical history.",
    tags: ["Web", "AI", "Healthcare"],
    author: "Bob Smith",
    likes: 31,
  },
  {
    id: 3,
    title: "LearnLingo",
    description: "An interactive language learning game that uses AR to create immersive experiences for learners.",
    tags: ["AR", "Education", "Mobile"],
    author: "Charlie Davis",
    likes: 18,
  },
]

export default function GallerySection() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Project Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <Image
                src={`/placeholder.svg?text=${project.title}`}
                alt={project.title}
                width={300}
                height={200}
                className="w-full h-40 object-cover"
              />
              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>By {project.author}</span>
                  <span>{project.likes} Likes</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

