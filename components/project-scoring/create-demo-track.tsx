"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { createExampleTrack } from "./example-config";

interface CreateDemoTrackProps {
  eventId: string;
  onTrackCreated?: () => void;
}

export function CreateDemoTrack({ eventId, onTrackCreated }: CreateDemoTrackProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateDemoTrack = async () => {
    setIsCreating(true);
    try {
      const track = await createExampleTrack(supabase, eventId);
      
      if (track) {
        toast({
          title: "Demo track created",
          description: "A new track with different question types has been created.",
        });
        
        if (onTrackCreated) {
          onTrackCreated();
        }
      } else {
        throw new Error("Failed to create track");
      }
    } catch (error) {
      console.error("Error creating demo track:", error);
      toast({
        title: "Error",
        description: "Failed to create demo track",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="my-4">
      <Button 
        onClick={handleCreateDemoTrack} 
        disabled={isCreating}
        variant="outline"
      >
        {isCreating ? "Creating..." : "Create Demo Track with Different Question Types"}
      </Button>
      <p className="text-sm text-gray-500 mt-2">
        This will create a demonstration track with multiple choice and Likert scale questions.
      </p>
    </div>
  );
} 