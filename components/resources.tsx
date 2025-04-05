import React from "react";

export interface Resource {
    id: number;
    title: string;
    description: string;
    fileUrl: string; // URL to the exported material (PDF, PNG, etc.)
    videoUrl?: string; // Optional YouTube embed URL
}

interface ResourcesModuleProps {
    resources?: Resource[];
}

const defaultResources: Resource[] = [
    {
        id: 1,
        title: "Introduction Module",
        description: "An overview of the basic concepts.",
        fileUrl: "/path/to/introduction.pdf",
        videoUrl: "https://www.youtube.com/embed/exampleVideoID",
    },
    {
        id: 2,
        title: "Advanced Concepts",
        description: "A deep dive into advanced topics.",
        fileUrl: "/path/to/advanced.pdf",
    },
];

export default function Resources({
    resources = defaultResources,
}: ResourcesModuleProps) {
    return (
        <div className="resources-module container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Resources</h1>
            <div className="resources-list">
                {resources.map((resource) => (
                    <div
                        key={resource.id}
                        className="resource-item border p-4 rounded shadow-sm mb-4"
                    >
                        <h2 className="text-xl font-bold mb-2">{resource.title}</h2>
                        <p className="text-gray-700 mb-2">{resource.description}</p>
                        <a
                            href={resource.fileUrl}
                            className="text-blue-500 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Material
                        </a>
                        {resource.videoUrl && (
                            <div className="mt-4">
                                <iframe
                                    width="560"
                                    height="315"
                                    src={resource.videoUrl}
                                    title={resource.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
