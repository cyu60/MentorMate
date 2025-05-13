"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EventRole } from "@/lib/types";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface UserEventRoleWithProfile {
  user_id: string;
  role: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface Participant {
  user_id: string;
  role: EventRole;
  display_name: string;
  email: string;
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
              display_name,
              email
            )
          `)
          .eq('event_id', eventId)
          .overrideTypes<UserEventRoleWithProfile[]>();

        if (error) throw error;

        // Transform the data
        const transformedData: Participant[] = (data as UserEventRoleWithProfile[] || []).map(role => ({
          user_id: role.user_id,
          role: role.role as EventRole,
          display_name: role.profiles?.display_name || role.user_id,
          email: role.profiles?.email || ""
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

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      participants.map((participant) => ({
        Name: participant.display_name,
        Email: participant.email,
        Role: participant.role,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${eventId}.csv`;
    a.click();
  };

  if (loading) {
    return <div>Loading participants...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.user_id}>
              <TableCell>{participant.display_name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <TableCell className="capitalize">{participant.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}