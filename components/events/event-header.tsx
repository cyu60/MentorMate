"use client";

import { HackathonNav } from "@/components/layout/hackathon-nav";
import { Badge } from "@/components/ui/badge";

export interface EventHeaderProps {
  eventName: string;
  coverImageUrl?: string | null;
  eventDate?: string;
  location?: string;
  description?: string;
  eventId: string;
}

export function EventHeader({
  eventName,
  coverImageUrl,
  eventDate,
  location,
  description,
  eventId,
}: EventHeaderProps) {
  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: coverImageUrl
            ? `url(${coverImageUrl})`
            : "linear-gradient(to bottom right, #4F46E5, #3B82F6)",
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-start pt-8 p-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          {eventName}
        </h1>
        {(eventDate || location) && (
          <div className="flex gap-2 mb-4">
            {eventDate && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-none"
              >
                {eventDate}
              </Badge>
            )}
            {location && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-none"
              >
                {location}
              </Badge>
            )}
          </div>
        )}
        {description && (
          <p className="text-white/80 max-w-3xl mb-2">{description}</p>
        )}
        <HackathonNav id={eventId} />
      </div>
    </div>
  );
}
