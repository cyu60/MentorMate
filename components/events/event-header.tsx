"use client";

import { HackathonNav } from "@/components/layout/hackathon-nav";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const clampedHeight = contentRef.current.clientHeight;
      setNeedsTruncation(contentHeight > clampedHeight);
    }
  }, [description]);

  return (
    <div
      className={`relative w-full ${
        isExpanded ? "h-auto" : "h-[250px] sm:h-[300px]"
      } rounded-lg overflow-hidden transition-all duration-300`}
    >
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
      <div className="relative z-10 h-full flex flex-col justify-start pt-6 sm:pt-8 px-4 sm:px-8 pb-4 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
          {eventName}
        </h1>
        {(eventDate || location) && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {eventDate && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-none text-xs sm:text-sm"
              >
                {eventDate}
              </Badge>
            )}
            {location && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-none text-xs sm:text-sm"
              >
                {location}
              </Badge>
            )}
          </div>
        )}
        {description && (
          <div>
            <p
              ref={contentRef}
              className={`text-white/80 text-sm sm:text-base max-w-3xl}
            >
              {description}
            </p>
            {needsTruncation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs sm:text-sm mt-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    Show less{" "}
                    <ChevronUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    Show more{" "}
                    <ChevronDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        <div className="mt-auto">
          <HackathonNav id={eventId} />
        </div>
      </div>
    </div>
  );
}
