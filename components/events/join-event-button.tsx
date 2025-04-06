"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventRole } from "@/lib/types";

export interface JoinEventButtonProps {
  eventId: string;
  eventName: string;
}

export function JoinEventButton({ eventId, eventName }: JoinEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EventRole>(
    EventRole.Participant
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkIfJoined() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        if (!session?.user?.email) return;

        // Get uid from user_profiles using email from auth session
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("uid")
          .eq("email", session.user.email)
          .single();

        if (profileError || !userProfile) {
          return;
        }

        const userId = userProfile.uid;

        const { data: roleData } = await supabase
          .from("user_event_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("event_id", eventId)
          .maybeSingle();

        if (roleData) {
          setHasJoined(true);
        }
      } catch (error) {
        console.error("Error checking event status:", error);
      }
    }

    checkIfJoined();
  }, [eventId]);

  const handleJoinEvent = async () => {
    try {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        localStorage.setItem("returnUrl", `/events/${eventId}/overview`);
        router.push("/login");
        return;
      }

      if (!session?.user?.email) return;

      // Get uid from user_profiles using email from auth session
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("uid")
        .eq("email", session.user.email)
        .single();

      if (profileError || !userProfile) {
        return;
      }

      const userId = userProfile.uid;

      // Insert into user_event_roles
      const { error: roleError } = await supabase
        .from("user_event_roles")
        .insert({
          user_id: userId,
          event_id: eventId,
          role: selectedRole,
        });

      if (roleError) {
        console.error("Error setting user role:", roleError.message);
        return;
      }

      setHasJoined(true);
      setIsDialogOpen(false);
      router.refresh();
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error joining event:", error.message);
      } else {
        console.error("Error joining event:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (hasJoined) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800">
          Join {eventName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select your role:</label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as EventRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventRole.Participant}>
                  Participant
                </SelectItem>
                <SelectItem value={EventRole.Mentor}>Mentor</SelectItem>
                <SelectItem value={EventRole.Judge}>Judge</SelectItem>
                <SelectItem value={EventRole.Organizer}>Organizer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleJoinEvent}
            disabled={isLoading}
            className="w-full bg-blue-700 hover:bg-blue-800"
          >
            {isLoading ? "Joining..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
