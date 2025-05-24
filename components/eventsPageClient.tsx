"use client";

import { useState, useMemo } from "react";
import { EventsList } from "@/components/events/events-list";
import { Input } from "@/components/ui/input";
import { EventItem } from "@/lib/types";
import { UI_TEXT, DEFAULT_VALUES } from "@/lib/config/constants";

export function EventsPageClient({ eventsList }: { eventsList: EventItem[] }) {
  const [searchTerm, setSearchTerm] = useState(DEFAULT_VALUES.SEARCH_TERM);

  const filteredEvents = useMemo(() => {
    return eventsList.filter((event) =>
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [eventsList, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative w-full mb-8">
        <Input
          type="text"
          placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventsList events={filteredEvents} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-500 max-w-sm">
            {searchTerm
              ? `No events match your search "${searchTerm}". Try adjusting your search terms.`
              : UI_TEXT.NO_EVENTS_FOUND}
          </p>
        </div>
      )}
    </div>
  );
}
