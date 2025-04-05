"use client";

import React, { useState } from 'react';
import { defaultResources, Resource } from './data';

interface CardProps {
    title: string;
    description: string;
    link?: string;
    fileUrl?: string;
    videoUrl?: string;
}

const ResourceCard: React.FC<CardProps> = ({ title, description, fileUrl, videoUrl }) => {
    const [showLink, setShowLink] = useState(false);

    return (
    <div
        className="notion-card"
        onClick={() => setShowLink(!showLink)}
        style={{
        border: '1px solid #e1e1e1',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)')}
    >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        {showLink && (
        <div>
            <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
            Open Resource
            </a>
            {videoUrl && (
            <div style={{ marginTop: '8px' }}>
                <iframe
                width="560"
                height="315"
                src={videoUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                ></iframe>
            </div>
            )}
        </div>
        )}
    </div>
    );
};

export default function ResourcesLayout() {
    const resources: Resource[] = defaultResources;

    return (
        <div
        style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            padding: '16px',
        }}
        >
        {resources.map((resource) => (
            <ResourceCard
            key={resource.id}
            title={resource.title}
            description={resource.description}
            fileUrl={resource.fileUrl}
            videoUrl={resource.videoUrl}
            />
        ))}
        </div>
    );
}