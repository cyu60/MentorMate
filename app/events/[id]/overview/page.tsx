import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { JoinEventButton } from "@/components/events/join-event-button";
import { EventStatusBar } from "@/components/events/event-status-bar";
import ReactMarkdown from "react-markdown";
import {
  EventDetails,
  Rule,
  ScheduleDay,
  ScheduleEvent,
  Resource,
  EventTrack,
} from "@/lib/types";
import { createSupabaseClient } from "@/app/utils/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

const defaultRules: Rule[] = [
  {
    title: "General Rules",
    items: [
      "All work must be completed during the hackathon",
      "Teams can have up to 4 members",
      "Projects must be original work",
      "Use of open source libraries and APIs is allowed",
    ],
  },
  {
    title: "Submission Requirements",
    items: [
      "Project must be submitted before the deadline",
      "Include a demo video",
      "Complete project documentation",
    ],
  },
];

export default async function EventOverviewPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);
  const supabase = await createSupabaseClient();

  // Update the Promise.all to use a join
  const [eventResult, tracksResult] = await Promise.all([
    supabase.from("events").select("*").eq("event_id", id).single(),
    supabase
      .from("event_tracks")
      .select(
        `
        *,
        prizes (
          prize_amount,
          prize_description
        )
      `
      )
      .eq("event_id", id),
  ]);

  if (eventResult.error) {
    notFound();
  }

  const typedEvent = eventResult.data as EventDetails;
  const tracks = (tracksResult.data || []) as EventTrack[];

  // Check if user has joined
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let hasJoined = false;

  if (user) {
    if (!user.email) return;

    const { data: userEventRoles } = await supabase
      .from("user_event_roles")
      .select("event_id")
      .in("uid", [user.id]);

    if (userEventRoles) {
      const events = userEventRoles.map((role) => role.event_id);
      hasJoined = events.includes(id);
    }
  }

  return (
    <div className="container mx-auto py-4">
      {/* Status Bar */}
      <EventStatusBar eventId={id} />

      {/* Join Button */}
      {!hasJoined && (
        <div className="flex justify-center mb-8">
          <JoinEventButton eventId={id} eventName={typedEvent.event_name} />
        </div>
      )}

      {/* Event Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{typedEvent.event_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{typedEvent.event_description}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card className="shadow-lg rounded-lg mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(typedEvent.rules || defaultRules).map((rule, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-lg mb-2 text-blue-800">
                  {rule.title}
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {rule.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      {typedEvent.event_schedule?.length > 0 && (
        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {typedEvent.event_schedule.map((day: ScheduleDay, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-xl mb-3 text-blue-800">
                    {day.time}
                  </h3>
                  <div className="space-y-2">
                    {day.events.map((event: ScheduleEvent, eIdx: number) => (
                      <div
                        key={eIdx}
                        className="flex justify-between items-center border-b pb-2 last:border-0"
                      >
                        <span className="font-medium text-gray-800">
                          {event.name}
                        </span>
                        <span className="text-gray-500 whitespace-nowrap">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracks */}
      {tracks.length > 0 && (
        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Prizes & Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracks.map((track) => (
                <Card key={track.track_id} className="shadow border rounded-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-blue-900">
                      {track.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {track.prizes && track.prizes.length > 0 ? (
                      <div className="space-y-4">
                        {track.prizes.map((prize, index) => (
                          <div
                            key={index}
                            className="border-b pb-3 last:border-b-0 last:pb-0"
                          >
                            <div className="text-2xl font-extrabold text-green-600 mb-2">
                              {prize.prize_amount}
                            </div>
                            <p className="text-gray-600">
                              {prize.prize_description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-extrabold text-green-600 mb-2">
                          TBD
                        </div>
                        <p className="text-gray-600">TBD</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {typedEvent.event_resources?.length > 0 && (
        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Important Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {typedEvent.event_resources.map((res: Resource, idx) => (
                <a
                  key={idx}
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-200 transition-colors rounded-lg shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {res.name}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
