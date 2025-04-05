export interface Resource {
    id: string;
    title: string;
    description: string;
    fileUrl: string; 
    thumbnail: string;
}

export const defaultResources: Resource[] = [
    {
        id: "1",
        title: "What is a Hackathon?",
        description: "Get a good grasp of what a hackathon is and how to prepare for one.",
        fileUrl: "https://www.canva.com/design/DAGiIjTZwwU/qZ9YyzVj0Qw_mPg10wFePQ/view?utm_content=DAGiIjTZwwU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h02954ba739",
        thumbnail: "/img/resource01.png",
    },
    {
        id: "2",
        title: "Stages of a Hackathon",
        description: "Learn about the different stages of a hackathon and how to navigate them.",
        fileUrl: "https://www.canva.com/design/DAGjnPa_Ko8/CLjZvYNfP1l3s4VZgN9Mjg/view?utm_content=DAGjnPa_Ko8&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf6cbf39f60",
        thumbnail: "/img/resource02.png",
    },
];