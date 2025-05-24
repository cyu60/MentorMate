"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/use-toast";
import { EventRole } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_ROLE_LABELS } from "@/features/user/roles/roles";
import { EventDetails } from "@/lib/types";

interface RoleLabelsTabProps {
  eventId: string;
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export function RoleLabelsTab({
  eventId,
  event,
  setEvent,
  saving,
  setSaving,
}: RoleLabelsTabProps) {
  const [roleLabels, setRoleLabels] =
    useState<Record<string, string>>(DEFAULT_ROLE_LABELS);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize labels from event if available
    if (event?.role_labels) {
      setRoleLabels({
        ...DEFAULT_ROLE_LABELS,
        ...event.role_labels,
      });
    }
  }, [event]);

  const handleLabelChange = (role: string, label: string) => {
    setRoleLabels((prev) => ({
      ...prev,
      [role]: label,
    }));
  };

  const handleSaveLabels = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("events")
        .update({ role_labels: roleLabels })
        .eq("event_id", eventId);

      if (error) {
        throw error;
      }

      // Update the event in state to reflect changes
      setEvent({
        ...event,
        role_labels: roleLabels,
      });

      toast({
        title: "Success",
        description: "Role labels updated successfully",
      });
    } catch (error) {
      console.error("Error updating role labels:", error);
      toast({
        title: "Error",
        description: "Failed to update role labels",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setRoleLabels(DEFAULT_ROLE_LABELS);
  };

  return (
    <Card className="p-4 border-2 border-blue-400">
      <CardHeader>
        <CardTitle>Customize Role Labels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Customize how roles are labeled throughout the platform. For
            example, you can change &quot;Judge&quot; to &quot;Investor&quot;
            for a demo day event.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(EventRole)
              .filter(([, value]) => value !== EventRole.Admin) // Exclude Admin role
              .map(([, role]) => (
                <div key={role} className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor={`role-${role}`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)} Label
                  </label>
                  <Input
                    id={`role-${role}`}
                    value={roleLabels[role] ?? ""}
                    onChange={(e) => handleLabelChange(role, e.target.value)}
                    placeholder={`Custom label for ${role}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: {DEFAULT_ROLE_LABELS[role]}
                  </p>
                </div>
              ))}
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={saving}
            >
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveLabels} disabled={saving}>
              {saving ? "Saving..." : "Save Labels"}
            </Button>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  Demo Day Example: Participant → Founder, Judge → Investor,
                  Mentor → Observer
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
