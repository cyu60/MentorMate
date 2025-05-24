import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { UUID } from "crypto";
import { isValidUUID } from "@/app/utils/supabase/queries";

interface Participant {
  uid: string;
  display_name: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicParticipantsPage({ params }: PageProps) {
  const supabase = await createSupabaseClient();
  const { id } = await params;

  const isUUID = isValidUUID(id);

  let query = supabase.from("events").select("event_id");

  if (isUUID) {
    // If it's a UUID, check both slug and event_id
    query = query.or(`slug.eq.${id},event_id.eq.${id}`);
  } else {
    // If it's not a UUID, only check slug
    query = query.eq("slug", id);
  }

  const { data: event } = await query.single();

  if (!event) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Event not found</div>
        </CardContent>
      </Card>
    );
  }

  const { data: participants, error } = await supabase
    .from("user_event_roles")
    .select("user_id, user_profiles!user_id(uid, display_name)")
    .eq("event_id", event.event_id)
    .eq("role", "participant")
    .overrideTypes<
      Array<{
        user_id: UUID;
        user_profiles: {
          uid: UUID;
          display_name: string;
        };
      }>
    >();

  if (error) {
    console.error("Error fetching participants:", error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Failed to load participants</div>
        </CardContent>
      </Card>
    );
  }

  //ignore type error
  const participantsList: Participant[] = participants
    ? participants.map((participant) => ({
        uid: participant.user_profiles.uid,
        display_name: participant.user_profiles.display_name,
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participantsList.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {participantsList.map((participant) => (
            <div key={participant.uid} className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {(participant.display_name?.[0] || "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {participant.display_name || "Anonymous Participant"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
