"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from "@/components/navbar"; 
import { Footer } from "@/components/footer"
import { motion } from 'framer-motion';
import { Mail } from "lucide-react"; 

type TeamMember = {
    name: string;
    imageUrl: string;
    profileUrl: string;
};

type ProjectDirector = TeamMember & {
    email: string; 
};

type TeamGroup = {
    position: string;
    members: TeamMember[];
};

const projectDirector: ProjectDirector = {
    name: "Chinat Yu",
    imageUrl: "/img/Chinat.png",
    profileUrl: "https://www.linkedin.com/in/chinat-yu/",
    email: "chinat@stanford.edu"
};

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
];

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
                <h1 className="mb-8 text-3xl sm:text-4xl md:text-5xl font-bold text-center text-blue-900">
                    Our Team
                </h1>
                
                <motion.section 
                    id="project-director" 
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold text-center mb-6 text-blue-800">Project Director</h2>
                    <div className="flex justify-center">
                        <div className="flex flex-col items-center">
                            <Link href={projectDirector.profileUrl} target="_blank" rel="noopener noreferrer">
                                <ProfileImage imageUrl={projectDirector.imageUrl} name={projectDirector.name} />
                            </Link>
                            <Link 
                                href={projectDirector.profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-md font-medium text-black hover:text-blue-500 transition-colors duration-200"
                            >
                                {projectDirector.name}
                            </Link>
                            <Link 
                                href={`mailto:${projectDirector.email}`} 
                                className="text-md text-blue-700 hover:text-blue-900 transition-colors duration-200 flex items-center mt-2"
                                aria-label={`Email ${projectDirector.name}`}
                            >
                                <Mail size={20} className="mr-2" />
                                {projectDirector.email}
                            </Link>
                        </div>
                    </div>
                </motion.section>
                
                {teamGroups.map((group, index) => (
                    <motion.section 
                        key={index} 
                        id={group.position.toLowerCase().replace(/\s+/g, '-')} 
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-800">{group.position}</h2>
                        <div className="flex flex-wrap justify-center gap-16">
                            {group.members.map((member, i) => (
                                <motion.div 
                                    key={i} 
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Link href={member.profileUrl} target="_blank" rel="noopener noreferrer">
                                        <ProfileImage imageUrl={member.imageUrl} name={member.name} />
                                    </Link>
                                    <Link 
                                        href={member.profileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-md font-medium text-black hover:text-blue-500 transition-colors duration-200"
                                    >
                                        {member.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                ))}
            </div>

            <Footer />
        </div>
    )
}
