"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon } from "lucide-react";
import { EventDetails } from "@/lib/types";
import { toast as ToastType } from "@/hooks/use-toast";

interface RulesTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: typeof ToastType;
}

export function RulesTab({
  event,
  setEvent,
  saving,
  setSaving,
  toast,
}: RulesTabProps) {
  const handleRulesUpdate = async () => {
    if (!event) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("events")
        .update({ rules: event.rules })
        .eq("event_id", event.event_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rules saved successfully",
      });
    } catch (error) {
      console.error("Error updating rules:", error);
      toast({
        title: "Error",
        description: "Failed to save rules",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {event.rules.map((rule, ruleIndex) => (
        <div
          key={ruleIndex}
          className="space-y-4 border-b pb-4 last:border-0"
        >
          <div className="flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <Label>Section Title</Label>
              <Input
                value={rule.title}
                onChange={(e) => {
                  const newRules = [...event.rules];
                  newRules[ruleIndex].title = e.target.value;
                  setEvent({ ...event, rules: newRules });
                }}
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="ml-2"
              onClick={() => {
                const newRules = event.rules.filter(
                  (_, i) => i !== ruleIndex
                );
                setEvent({ ...event, rules: newRules });
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>

          {rule.items.map((item, itemIndex) => (
            <div key={itemIndex} className="space-y-2 flex items-end gap-2">
              <div className="flex-1">
                <Label>Rule {itemIndex + 1}</Label>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newRules = [...event.rules];
                    newRules[ruleIndex].items[itemIndex] = e.target.value;
                    setEvent({ ...event, rules: newRules });
                  }}
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newRules = [...event.rules];
                  newRules[ruleIndex].items = newRules[
                    ruleIndex
                  ].items.filter((_, i) => i !== itemIndex);
                  setEvent({ ...event, rules: newRules });
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => {
              const newRules = [...event.rules];
              newRules[ruleIndex].items.push("");
              setEvent({ ...event, rules: newRules });
            }}
          >
            Add Rule
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={() => {
          setEvent({
            ...event,
            rules: [...event.rules, { title: "", items: [""] }],
          });
        }}
      >
        Add Rule Section
      </Button>

      <Button
        onClick={handleRulesUpdate}
        disabled={saving}
        className="w-full mt-4"
      >
        {saving ? "Saving..." : "Save Rules"}
      </Button>
    </div>
  );
} 