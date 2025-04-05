export interface Resource {
    id: string;
    title: string;
    description: string;
    fileUrl: string; 
    videoUrl?: string; 
}

export const defaultResources: Resource[] = [
    {
        id: "1",
        title: "Introduction Module",
        description: "An overview of the basic concepts.",
        fileUrl: "/path/to/introduction.pdf",
        videoUrl: "https://www.youtube.com/embed/exampleVideoID",
    },
    {
        id: "2",
        title: "Advanced Concepts",
        description: "A deep dive into advanced topics.",
        fileUrl: "/path/to/advanced.pdf",
    },
]