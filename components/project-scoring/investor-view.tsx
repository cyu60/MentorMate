"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Check, X, DollarSign } from "lucide-react";

interface InvestorViewProps {
  projectId: string;
  eventId: string;
  judgeId: string;
  trackId: string;
}

export function InvestorView({
  projectId,
  eventId,
  judgeId,
  trackId,
}: InvestorViewProps) {
  const [decision, setDecision] = useState<string | null>(null);
  const [interestLevel, setInterestLevel] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [existingScore, setExistingScore] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<any | null>(null);
  const { toast } = useToast();

  // Investment interest levels with descriptions
  const interestLevels = [
    { value: 0, label: "No interest" },
    { value: 1, label: "Needs more development" },
    { value: 2, label: "Interesting but not ready" },
    { value: 3, label: "Would consider after improvements" },
    { value: 4, label: "High interest, want follow-up" },
    { value: 5, label: "Very interested in immediate investment" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Check for existing score
        const { data, error } = await supabase
          .from("project_scores")
          .select("*")
          .eq("project_id", projectId)
          .eq("judge_id", judgeId)
          .eq("event_id", eventId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setExistingScore(data);
          // Convert special investor scoring format back to form values
          if (data.scores && data.scores.investor_decision) {
            setDecision(data.scores.investor_decision);
            setInterestLevel(data.scores.interest_level || 0);
            setComments(data.comments || "");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, [projectId, judgeId, eventId, toast]);

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      // Prepare the score data in a special format for investor view
      const scoreData = {
        investor_decision: decision,
        interest_level: interestLevel,
      };

      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from("project_scores")
          .update({
            scores: scoreData,
            comments: comments,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingScore.id);

        if (error) throw error;
      } else {
        // Create new score
        const { error } = await supabase.from("project_scores").insert({
          project_id: projectId,
          judge_id: judgeId,
          event_id: eventId,
          track_id: trackId,
          scores: scoreData,
          comments: comments,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Your feedback has been saved",
      });
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Investment Decision: {project.project_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Investment Decision */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Investment Decision</h3>
              <RadioGroup
                value={decision || ""}
                onValueChange={setDecision}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent">
                  <RadioGroupItem value="invest" id="invest" />
                  <Label htmlFor="invest" className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span>Invest</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent">
                  <RadioGroupItem value="maybe" id="maybe" />
                  <Label htmlFor="maybe" className="flex items-center">
                    <DollarSign className="w-5 h-5 text-yellow-500 mr-2" />
                    <span>Maybe (Need more info)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent">
                  <RadioGroupItem value="pass" id="pass" />
                  <Label htmlFor="pass" className="flex items-center">
                    <X className="w-5 h-5 text-red-600 mr-2" />
                    <span>Pass</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Interest Level Slider - only show if decision is "invest" or "maybe" */}
            {(decision === "invest" || decision === "maybe") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Interest Level</h3>
                  <div className="flex items-center">
                    <DollarSign
                      className={`h-4 w-4 ${
                        interestLevel >= 3 ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <DollarSign
                      className={`h-4 w-4 ${
                        interestLevel >= 4 ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <DollarSign
                      className={`h-4 w-4 ${
                        interestLevel >= 5 ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>
                <Slider
                  value={[interestLevel]}
                  max={5}
                  step={1}
                  onValueChange={(value) => setInterestLevel(value[0])}
                  className="py-4"
                />
                <div className="text-sm text-muted-foreground">
                  {
                    interestLevels.find(
                      (level) => level.value === interestLevel
                    )?.label
                  }
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-lg font-medium">
                Feedback & Notes
              </Label>
              <Textarea
                id="comments"
                placeholder="Add your feedback and notes about this project..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSaving || !decision}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Submit Feedback"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
