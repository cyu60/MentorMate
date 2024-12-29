"use client";

import { useState, useEffect } from 'react';
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
            { name: "Matthew Law", imageUrl: "/placeholder.svg?height=200&width=200", profileUrl: "https://www.linkedin.com/in/matthew-law-0x251/" },
        ]
    },
]

export default function TeamGrid() {
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section');
            let currentActiveSection = '';

            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200 && window.pageYOffset < sectionTop + sectionHeight - 200) {
                    currentActiveSection = section.id;
                }
            });

            setActiveSection(currentActiveSection);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white">
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <motion.h1 
                    className="text-4xl font-bold text-center mb-12 text-blue-900"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Our Team
                </motion.h1>
                
                {/* Table of Contents */}
                <nav className="mb-16 sticky top-0 bg-white bg-opacity-90 py-4 z-10 shadow-md rounded-lg">
                    <ul className="flex flex-wrap justify-center gap-6">
                        <li>
                            <a 
                                href="#project-director" 
                                className={`text-lg font-medium transition-colors duration-200 ${activeSection === 'project-director' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                            >
                                Project Director
                            </a>
                        </li>
                        {teamGroups.map((group, index) => (
                            <li key={index}>
                                <a 
                                    href={`#${group.position.toLowerCase().replace(/\s+/g, '-')}`} 
                                    className={`text-lg font-medium transition-colors duration-200 ${activeSection === group.position.toLowerCase().replace(/\s+/g, '-') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    {group.position}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                {/* Project Director Section */}
                <motion.section 
                    id="project-director" 
                    className="mb-24"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-semibold text-center mb-12 text-blue-800">Project Director</h2>
                    <div className="flex justify-center">
                        <div className="flex flex-col items-center">
                            <motion.div 
                                className="relative w-48 h-48 mb-6 rounded-full overflow-hidden shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Image
                                    src={projectDirector.imageUrl}
                                    alt={`${projectDirector.name}'s profile picture`}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                            <Link href={projectDirector.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-blue-700 hover:text-blue-500 transition-colors duration-200">
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
                        className="mb-24"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h2 className="text-3xl font-semibold text-center mb-12 text-blue-800">{group.position}</h2>
                        <div className="flex flex-wrap justify-center gap-16">
                            {group.members.map((member, i) => (
                                <motion.div 
                                    key={i} 
                                    className="flex flex-col items-center"
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden shadow-lg">
                                        <Image
                                            src={member.imageUrl}
                                            alt={`${member.name}'s profile picture`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <Link href={member.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-blue-700 hover:text-blue-500 transition-colors duration-200">
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

