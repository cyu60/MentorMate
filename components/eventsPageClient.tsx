"use client";

import { useState, useMemo } from "react";
import { EventsList } from "@/components/events/events-list";
import { Input } from "@/components/ui/input";
// import { DateRangePicker } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css"; 

type EventItem = {
  event_id: string;
  event_name: string;
  event_date: string;
  location: string;
  cover_image_url?: string;
};

interface EventsPageClientProps {
  eventsList: EventItem[];
}

export function EventsPageClient({ eventsList }: EventsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // Default date range to today for both start and end.
  // const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
  //   start: new Date().toISOString().split("T")[0],
  //   end: new Date().toISOString().split("T")[0],
  // });
  // const [showCalendar, setShowCalendar] = useState(false);
  // const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
  //       setShowCalendar(false);
  //     }
  //   }
  //   if (showCalendar) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [showCalendar]);

  const filteredEvents = useMemo(() => {
    return eventsList.filter((event) => {
      // Filter by event name
      const nameMatch = event.event_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Date range filtering commented out
      // const eventDate = new Date(event.event_date);
      // let dateMatch = true;
      // if (dateRange.start) {
      //   dateMatch = dateMatch && eventDate >= new Date(dateRange.start);
      // }
      // if (dateRange.end) {
      //   dateMatch = dateMatch && eventDate <= new Date(dateRange.end);
      // }

      // Return only the name match (date filtering is disabled)
      return nameMatch; // && dateMatch;
    });
  }, [eventsList]);

  // Display formatted date range in the input-like field
  // const formattedDateRange = `${dateRange.start} to ${dateRange.end}`;

  return (
    <div>
      {/* Search & Date Range Input */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search hackathons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        {/* <div className="relative w-full md:w-1/4">
          <div
            className="border border-gray-300 rounded px-3 py-2 w-full h-10 cursor-pointer bg-white flex items-center"
            onClick={() => setShowCalendar((prev) => !prev)}
          >
            {formattedDateRange}
          </div>
          {showCalendar && (
            <div ref={calendarRef} className="absolute z-10 mt-2">
              <DateRangePicker
                ranges={[
                  {
                    startDate: dateRange.start ? new Date(dateRange.start) : new Date(),
                    endDate: dateRange.end ? new Date(dateRange.end) : new Date(),
                    key: "selection",
                  },
                ]}
                onChange={(ranges) =>
                  setDateRange({
                    start: ranges.selection.startDate
                      ? ranges.selection.startDate.toISOString().split("T")[0]
                      : "",
                    end: ranges.selection.endDate
                      ? ranges.selection.endDate.toISOString().split("T")[0]
                      : "",
                  })
                }
                color="#2563eb"
                staticRanges={[]} // Remove preset ranges
                inputRanges={[]}  // Remove input ranges
              />
            </div>
          )}
        </div> */}
      </div> 

      {/* Render Filtered Events */}
      <EventsList events={filteredEvents} />

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">
          No events found for the selected filters.
        </p>
      )}
    </div>
  );
}
