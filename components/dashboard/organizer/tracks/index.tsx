"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDetails, EventScoringConfig } from "@/lib/types";

// Import component tabs
import { TracksTab } from "./TracksTab";
import { PrizesTab } from "./PrizesTab";

interface EventTracksContainerProps {
  eventId: string;
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  scoringConfig: EventScoringConfig | null;
  setScoringConfig: React.Dispatch<React.SetStateAction<EventScoringConfig | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: (props: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void;
}

export function EventTracksContainer({
  eventId,
  event,
  setEvent,
  scoringConfig,
  setScoringConfig,
  saving,
  setSaving,
  toast,
}: EventTracksContainerProps) {
  const [activeSubTab, setActiveSubTab] = useState("tracks");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracks & Prizes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="tracks">Tracks & Scoring</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
          </TabsList>

          {/* Tracks */}
          <TabsContent value="tracks">
            <TracksTab
              eventId={eventId}
              event={event}
              setEvent={setEvent}
              scoringConfig={scoringConfig}
              setScoringConfig={setScoringConfig}
              saving={saving}
              setSaving={setSaving}
              toast={toast}
            />
          </TabsContent>

          {/* Prizes */}
          <TabsContent value="prizes">
            <PrizesTab
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