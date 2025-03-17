import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { JoinEventButton } from '@/components/events/join-event-button';
import { EventStatusBar } from '@/components/events/event-status-bar';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ScheduleEvent {
  name: string;
  time: string;
}

interface ScheduleDay {
  time: string;
  events: ScheduleEvent[];
}

interface Prize {
  track: string;
  prize: string;
  description: string;
}

interface Resource {
  name: string;
  link: string;
}

interface Rule {
  title: string;
  items: string[];
}

interface Event {
  event_id: string;
  event_name: string;
  event_date: string;
  location: string;
  event_description: string;
  event_schedule: ScheduleDay[];
  event_prizes: Prize[];
  event_resources: Resource[];
  created_at: string;
  rules: Rule[];
  cover_image_url?: string | null;
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventOverviewPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);
  const supabase = createSupabaseClient();

  // Check if user has joined
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let hasJoined = false;

  if (session) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select()
      .eq("uid", session.user.id)
      .maybeSingle();

    if (profile) {
      const events = profile.events || [];
      hasJoined = events.includes(id);
    }
  }

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      event_id,
      event_name,
      event_date,
      location,
      event_description,
      event_schedule,
      event_prizes,
      event_resources,
      created_at,
      rules,
      cover_image_url
    `)
    .eq("event_id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const typedEvent = event as Event;

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <EventStatusBar eventId={id} />

      {/* Join Button */}
      {!hasJoined && (
        <div className="flex justify-center mt-8">
          <JoinEventButton eventId={id} eventName={typedEvent.event_name} />
        </div>
      )}

      {/* Rules */}
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(typedEvent.rules || defaultRules).map((rule, index) => (
              <div key={index}>
                <h3 className="font-bold text-lg mb-2 text-blue-800">
                  {rule.title}
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {rule.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      {typedEvent.event_schedule && typedEvent.event_schedule.length > 0 && (
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {typedEvent.event_schedule.map(
                (day: ScheduleDay, index: number) => (
                  <div key={index}>
                    <h3 className="font-bold text-xl mb-3 text-blue-800">
                      {day.time}
                    </h3>
                    <div className="space-y-2">
                      {day.events.map(
                        (scheduleEvent: ScheduleEvent, eventIndex: number) => (
                          <div
                            key={eventIndex}
                            className="flex justify-between items-center border-b pb-2 last:border-0"
                          >
                            <span className="font-medium text-gray-800">
                              {scheduleEvent.name}
                            </span>
                            <span className="text-gray-500">
                              {scheduleEvent.time}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prizes */}
      {typedEvent.event_prizes && typedEvent.event_prizes.length > 0 && (
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Prizes & Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {typedEvent.event_prizes.map((prize: Prize, index: number) => (
                <Card key={index} className="shadow border rounded-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-blue-900">
                      {prize.track}
                    </CardTitle>
                    <div className="text-2xl font-extrabold text-green-600">
                      {prize.prize}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{prize.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {typedEvent.event_resources && typedEvent.event_resources.length > 0 && (
        <Card className="shadow-lg rounded-lg">
          <CardHeader className= "pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Important Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {typedEvent.event_resources.map(
                (resource: Resource, index: number) => (
                  <a
                    key={index}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-200 transition-colors rounded-lg shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {resource.name}
                    </span>
                  </a>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
