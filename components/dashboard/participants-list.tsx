"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EventRole } from "@/lib/types";
import { Database } from "@/lib/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserEventRoleWithProfile {
  user_id: string;
  role: string;
  profiles: {
    display_name: string;
  }[];
}

interface Participant {
  user_id: string;
  role: EventRole;
  display_name: string;
}

interface ParticipantsListProps {
  eventId: string;
}

export function ParticipantsList({ eventId }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipants() {
      try {
        // Get participants with their profile info
        const { data, error } = await supabase
          .from('user_event_roles')
          .select(`
            user_id,
            role,
            profiles:user_id (
              display_name
            )
          `)
          .eq('event_id', eventId);

        if (error) throw error;

        // Transform the data
        const transformedData: Participant[] = (data as UserEventRoleWithProfile[] || []).map(role => ({
          user_id: role.user_id,
          role: role.role as EventRole,
          display_name: role.profiles?.display_name || role.user_id
        }));

        setParticipants(transformedData);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [eventId]);

  if (loading) {
    return <div>Loading participants...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.user_id}>
            <TableCell>{participant.display_name}</TableCell>
            <TableCell className="capitalize">{participant.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}