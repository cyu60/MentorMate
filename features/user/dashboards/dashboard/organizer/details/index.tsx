"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDetails } from "@/lib/types";
import { toast as useToast } from "@/lib/hooks/use-toast";

// Import component tabs
import { BasicInfoTab } from "./BasicInfoTab";
import { ScheduleTab } from "./ScheduleTab";
import { ResourcesTab } from "./ResourcesTab";
import { RulesTab } from "./RulesTab";

interface EventDetailsTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  router: ReturnType<typeof useRouter>;
  toast: typeof useToast;
}

export function EventDetailsTab({
  event,
  setEvent,
  saving,
  setSaving,
  router,
  toast,
}: EventDetailsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("basic-info");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 gap-4 w-full h-auto">
            <TabsTrigger value="basic-info" className="flex-1">Basic Information</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">Schedule</TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
            <TabsTrigger value="rules" className="flex-1">Rules</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic-info">
            <BasicInfoTab
              event={event}
              setEvent={setEvent}
              saving={saving}
              setSaving={setSaving}
              toast={toast}
              router={router}
            />
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule">
            <ScheduleTab
              event={event}
              setEvent={setEvent}
              saving={saving}
              setSaving={setSaving}
              toast={toast}
            />
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources">
            <ResourcesTab
              event={event}
              setEvent={setEvent}
              saving={saving}
              setSaving={setSaving}
              toast={toast}
            />
          </TabsContent>

          {/* Rules */}
          <TabsContent value="rules">
            <RulesTab
              event={event}
              setEvent={setEvent}
              saving={saving}
              setSaving={setSaving}
              toast={toast}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
