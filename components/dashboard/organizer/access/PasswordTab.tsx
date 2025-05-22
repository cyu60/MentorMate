"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { EventRole, EventVisibility } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getRoleLabel } from "@/lib/utils/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PasswordTabProps {
  eventId: string;
  roleLabels?: Record<string, string> | null;
}

export function PasswordTab({ eventId, roleLabels }: PasswordTabProps) {
  const [rolePasswords, setRolePasswords] = useState<Record<string, string>>(
    {}
  );
  const [eventPassword, setEventPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState<EventVisibility | null>(null);

  // List of available roles from the EventRole enum, excluding Admin
  const availableRoles = Object.values(EventRole).filter(
    (role) => role !== EventRole.Admin
  );

  useEffect(() => {
    // Fetch the current event visibility
    const fetchEventVisibility = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("visibility")
        .eq("event_id", eventId)
        .single();

      if (error) {
        console.error("Error fetching event visibility:", error);
      } else if (data) {
        setVisibility(data.visibility);
      }
    };

    fetchEventVisibility();
  }, [eventId]);

  const handlePasswordChange = (role: string, password: string) => {
    setRolePasswords((prev) => ({
      ...prev,
      [role]: password,
    }));
  };

  const handleSetPassword = async (role: string) => {
    try {
      setIsLoading(true);
      const password = rolePasswords[role] || "";

      const response = await fetch("/api/roles/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          role,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toast({
          title: "Error",
          description: data.error || "Failed to set password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${role} password updated successfully`,
      });

      // Clear password input
      handlePasswordChange(role, "");
    } catch (error) {
      console.error("Error setting password:", error);
      toast({
        title: "Error",
        description: "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEventPassword = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/roles/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          role: "event", // Special role type for event password
          password: eventPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toast({
          title: "Error",
          description: data.error || "Failed to set event password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event password updated successfully",
      });

      // Clear password input
      setEventPassword("");
    } catch (error) {
      console.error("Error setting event password:", error);
      toast({
        title: "Error",
        description: "Failed to set event password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisibilityChange = async (value: EventVisibility) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("events")
        .update({ visibility: value })
        .eq("event_id", eventId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update event visibility",
          variant: "destructive",
        });
        return;
      }

      setVisibility(value);

      toast({
        title: "Success",
        description: "Event visibility updated successfully",
      });
    } catch (error) {
      console.error("Error updating event visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update event visibility",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="p-4 border-2 border-blue-400">
        <CardHeader>
          <CardTitle>Event Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Visibility</label>
              <Select
                value={visibility || ""}
                onValueChange={(value) =>
                  handleVisibilityChange(value as EventVisibility)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EventVisibility.Public}>Public</SelectItem>
                  <SelectItem value={EventVisibility.Private}>
                    Private (Password Protected)
                  </SelectItem>
                  <SelectItem value={EventVisibility.Draft}>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visibility === EventVisibility.Private && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Event Password (for Private events)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={eventPassword}
                    onChange={(e) => setEventPassword(e.target.value)}
                    placeholder="Set event password"
                  />
                  <Button
                    onClick={handleSetEventPassword}
                    disabled={isLoading || !eventPassword}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  This password will be required for anyone to join the event.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="p-4 border-2 border-blue-400">
        <CardHeader>
          <CardTitle>Role Passwords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableRoles.map((role) => {
              const label = getRoleLabel(role, roleLabels);
              return (
                <div key={role} className="space-y-2">
                  <label className="text-sm font-medium">
                    {label} Password
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={rolePasswords[role] || ""}
                      onChange={(e) => handlePasswordChange(role, e.target.value)}
                      placeholder={`Set ${label.toLowerCase()} password`}
                    />
                    <Button
                      onClick={() => handleSetPassword(role)}
                      disabled={isLoading || !rolePasswords[role]}
                    >
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    This password will be used by {label.toLowerCase()}s to join the event.
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
