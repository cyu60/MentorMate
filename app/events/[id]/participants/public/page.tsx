import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createSupabaseClient } from "@/app/utils/supabase/server"

interface Participant {
  uid: string
  display_name: string | null
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicParticipantsPage({
  params
}: PageProps) {
  const supabase = createSupabaseClient()
  const { id } = await params
  
  const { data: participants, error } = await supabase
    .from('user_profiles')
    .select('uid, display_name')
    .not('events', 'is', null)
    .contains('events', [id])

  if (error) {
    console.error('Error fetching participants:', error)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Failed to load participants</div>
        </CardContent>
      </Card>
    )
  }

  const participantsList: Participant[] = participants || []

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
                  {(participant.display_name?.[0] || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {participant.display_name || 'Anonymous Participant'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}