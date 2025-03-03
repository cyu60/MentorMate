import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";

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
      // "Provide access to source code",
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

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const typedEvent = event as Event;

  return (
    <div className="space-y-8">
      {/* Event Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{typedEvent.event_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">{typedEvent.event_date}</Badge>
            <Badge variant="secondary">{typedEvent.location}</Badge>
          </div>
          <p className="text-muted-foreground">
            {typedEvent.event_description}
          </p>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(typedEvent.rules || defaultRules).map((rule, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-2">{rule.title}</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {rule.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule - only show if there are schedule items */}
      {typedEvent.event_schedule && typedEvent.event_schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {typedEvent.event_schedule.map(
                (day: ScheduleDay, index: number) => (
                  <div key={index}>
                    <h3 className="font-semibold text-lg mb-3">{day.time}</h3>
                    <div className="space-y-2">
                      {day.events.map(
                        (scheduleEvent: ScheduleEvent, eventIndex: number) => (
                          <div
                            key={eventIndex}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <span>{scheduleEvent.name}</span>
                            <span className="text-muted-foreground">
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

      {/* Prizes - only show if there are prizes */}
      {typedEvent.event_prizes && typedEvent.event_prizes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prizes & Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {typedEvent.event_prizes.map((prize: Prize, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{prize.track}</CardTitle>
                    <div className="text-xl font-bold text-primary">
                      {prize.prize}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{prize.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources - only show if there are resources */}
      {typedEvent.event_resources && typedEvent.event_resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Important Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {typedEvent.event_resources.map(
                (resource: Resource, index: number) => (
                  <a
                    key={index}
                    href={resource.link}
                    className="flex items-center justify-center p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {resource.name}
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
