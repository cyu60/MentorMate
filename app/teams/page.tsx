"use client";

import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from "@/components/navbar"
import { motion } from 'framer-motion'

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
    imageUrl: "/img/Chinat.png",
    profileUrl: "https://www.linkedin.com/in/chinat-yu/"
}

const teamGroups: TeamGroup[] = [
    {
        position: "Faculty Advisors",
        members: [
            { name: "Kristen Blair", imageUrl: "/img/Kristen.png", profileUrl: "https://profiles.stanford.edu/kristen-blair" },
            { name: "Glenn Fajardo", imageUrl: "/img/Glenn.png", profileUrl: "https://dschool.stanford.edu/team-directory/glenn-fajardo" },
        ]
    },
    {
        position: "Research Intern",
        members: [
            { name: "Aurelia Sindhunirmala", imageUrl: "/img/Lia.png", profileUrl: "https://www.linkedin.com/in/aurelia-sindhunirmala/" },
            { name: "Matthew Law", imageUrl: "/img/Matthew.png", profileUrl: "https://www.linkedin.com/in/matthew-law-0x251/" },
        ]
    },
]

const ProfileImage = ({ imageUrl, name }: { imageUrl: string, name: string }) => (
    <motion.div 
        className="relative w-40 h-40 mb-6 rounded-full overflow-hidden shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
    >
        <Image
            src={imageUrl}
            alt={`${name}'s profile picture`}
            fill
            className="object-cover"
        />
    </motion.div>
);

export default function TeamGrid() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white">
            <Navbar />
            <div className="container mx-auto">
                <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-center text-blue-900">
                    Our Team
                </h1>
                
                {/* Project Director Section */}
                <motion.section 
                    id="project-director" 
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold text-center mb-4 text-blue-800">Project Director</h2>
                    <div className="flex justify-center">
                        <div className="flex flex-col items-center">
                            <ProfileImage imageUrl={projectDirector.imageUrl} name={projectDirector.name} />
                            <Link href={projectDirector.profileUrl} target="_blank" rel="noopener noreferrer" className="text-md font-medium text-black hover:text-blue-500 transition-colors duration-200">
                                {projectDirector.name}
                            </Link>
                        </div>
                    </div>
                </motion.section>
                
                {/* Other Team Members Sections */}
                {teamGroups.map((group, index) => (
                    <motion.section 
                        key={index} 
                        id={group.position.toLowerCase().replace(/\s+/g, '-')} 
                        className="mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-800">{group.position}</h2>
                        <div className="flex flex-wrap justify-center gap-16">
                            {group.members.map((member, i) => (
                                <motion.div 
                                    key={i} 
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <ProfileImage imageUrl={member.imageUrl} name={member.name} />
                                    <Link href={member.profileUrl} target="_blank" rel="noopener noreferrer" className="text-md font-medium text-black hover:text-blue-500 transition-colors duration-200">
                                        {member.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                ))}
            </div>
        </div>
    )
}
