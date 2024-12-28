import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar";


type TeamMember = {
    name: string;
    imageUrl: string;
}

type TeamGroup = {
    position: string;
    members: [TeamMember, TeamMember];
}

const teamGroups: TeamGroup[] = [
    {
        position: "Development",
        members: [
        { name: "Jane Doe", imageUrl: "/placeholder.svg?height=200&width=200" },
        { name: "John Smith", imageUrl: "/placeholder.svg?height=200&width=200" },
        ]
    },
    {
        position: "Design",
        members: [
        { name: "Alice Johnson", imageUrl: "/placeholder.svg?height=200&width=200" },
        { name: "Bob Williams", imageUrl: "/placeholder.svg?height=200&width=200" },
        ]
    },
]

export default function TeamGrid() {
    return (
        <div className="container mx-auto">
            <Navbar />
            <h1 className="text-3xl font-bold text-center mb-8">Our Team</h1>
            <div className="space-y-8">
                {teamGroups.map((group, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                    <h2 className="text-xl font-semibold text-center py-4 bg-primary text-primary-foreground">
                        {group.position}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 p-4">
                        {group.members.map((member, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="relative w-40 h-40 mb-2">
                            <Image
                                src={member.imageUrl}
                                alt={`${member.name}'s profile picture`}
                                fill
                                className="object-cover rounded-full"
                            />
                            </div>
                            <p className="text-center font-medium">{member.name}</p>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
    )
}

