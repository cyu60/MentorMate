import React from "react";
import { defaultResources, Resource } from "./data";

export default function ResourcesLayout() {
    return (
        <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {defaultResources.map((resource: Resource) => (
            <a
                key={resource.id}
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                group 
                relative 
                flex 
                flex-col 
                justify-center 
                rounded-lg 
                border 
                border-gray-200 
                bg-gradient-to-br 
                from-gray-50 
                to-white 
                p-6 
                shadow-sm 
                transition 
                hover:shadow-md
                "
            >
                {/* Thumbnail / Icon */}
                <img
                src={resource.thumbnail}
                alt={resource.title}
                className="mb-4 h-10 w-10 object-contain"
                />

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                {resource.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
            </a>
            ))}
        </div>
        </div>
    );
}
