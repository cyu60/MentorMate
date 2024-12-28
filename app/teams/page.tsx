"use client";

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

type TeamMember = {
    name: string;
    imageUrl: string;
    profileUrl: string;
}

type ProjectDirector = TeamMember;

type TeamGroup = {
    position: string;
    members: TeamMember[];
}

const projectDirector: ProjectDirector = {
    name: "Chinat Yu",
    imageUrl: "/placeholder.svg?height=200&width=200",
    profileUrl: "https://www.linkedin.com/in/chinat-yu/"
}

const teamGroups: TeamGroup[] = [
    {
        position: "Research Intern",
        members: [
            { name: "Aurelia Sindhunirmala", imageUrl: "/placeholder.svg?height=200&width=200", profileUrl: "https://www.linkedin.com/in/aurelia-sindhunirmala/" },
            { name: "Matthew Law", imageUrl: "/placeholder.svg?height=200&width=200", profileUrl: "https://www.linkedin.com/in/matthew-law-0x251/" },
        ]
    },
    // Add more positions and team members as needed
]

export default function TeamGrid() {
    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center mb-8">Our Team</h1>
            
            <div className="container mx-auto">
                {/* Project Director Section */}
                <Card className="overflow-hidden mb-8">
                    <CardContent className="p-0">
                        <h2 className="text-xl font-semibold text-center py-4 bg-primary text-primary-foreground">
                            Project Director
                        </h2>
                        <div className="flex justify-center p-4">
                            <div className="flex flex-col items-center">
                                <div className="relative w-40 h-40 mb-2">
                                    <Image
                                        src={projectDirector.imageUrl}
                                        alt={`${projectDirector.name}'s profile picture`}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                </div>
                                <Link href={projectDirector.profileUrl} className="text-center font-medium hover:underline">
                                    {projectDirector.name}
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Other Team Members Section */}
                <div className="space-y-8">
                    {teamGroups.map((group, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-0">
                                <h2 className="text-xl font-semibold text-center py-4 bg-primary text-primary-foreground">
                                    {group.position}
                                </h2>
                                <div className="flex flex-wrap justify-center gap-8 p-4">
                                    {group.members.map((member, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className="relative w-32 h-32 mb-2">
                                                <Image
                                                    src={member.imageUrl}
                                                    alt={`${member.name}'s profile picture`}
                                                    fill
                                                    className="object-cover rounded-full"
                                                />
                                            </div>
                                            <Link href={member.profileUrl} className="text-center font-medium hover:underline">
                                                {member.name}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
        </div>
    )
}

