"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordTab } from "./PasswordTab";
import { RoleLabelsTab } from "./RoleLabelsTab";
import { EventDetails } from "@/lib/types";

interface AccessTabProps {
  eventId: string;
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AccessTab({ 
  eventId,
  event,
  setEvent,
  saving,
  setSaving
}: AccessTabProps) {
  const [activeTab, setActiveTab] = useState("password");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="role-labels">Role Labels</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <PasswordTab eventId={eventId} roleLabels={event.role_labels} />
          </TabsContent>

          <TabsContent value="role-labels">
            <RoleLabelsTab
              eventId={eventId}
              event={event}
              setEvent={setEvent}
              saving={saving}
              setSaving={setSaving}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 