"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Pencil, CheckCircle2 } from "lucide-react";

// Initialize Supabase client once at module level
const supabase = createClient();

interface GoalSectionProps {
  eventId?: string; // Optional: will get from URL if not provided
}

interface Goal {
  id: string;
  user_id: string;
  event_id: string;
  type: "goal" | "journal";
  content: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  status: "in_progress" | "completed";
}

const goalRecommendations = [
  "Connect with 3 peers or professionals in your field for knowledge sharing by [date]",
  "Complete an AI project using [specific technology] to improve your technical skills by [date]",
  "Conduct user research with 3 target users and document key insights by [date]",
];

export default function GoalSection({
  eventId: propEventId,
}: GoalSectionProps) {
  const params = useParams();
  const eventId = propEventId || (params.id as string);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.email) return;

    // Get uid from user_profiles using email from auth session
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("uid")
      .eq("email", session.session.user.email)
      .single();

    if (profileError || !userProfile) {
      toast({
        title: "Error finding user profile",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("platform_engagement")
      .select("*")
      .eq("event_id", eventId)
      .eq("type", "goal")
      .eq("user_id", userProfile.uid)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching goals",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setGoals(data);
    }
  }, [eventId, toast]);

  useEffect(() => {
    if (eventId) {
      fetchGoals();
    }
  }, [eventId, fetchGoals]);

  const incrementPulse = async (userEmail: string) => {
    const { data: profiles, error: fetchError } = await supabase
      .from("user_profiles")
      .select("pulse")
      .eq("email", userEmail)
      .single();

    if (fetchError) {
      console.error("Error fetching pulse:", fetchError);
      return;
    }

    const currentPulse = profiles?.pulse || 0;
    const newPulse = currentPulse + 1;

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ pulse: newPulse })
      .eq("email", userEmail);

    if (updateError) {
      console.error("Error updating pulse:", updateError);
      toast({
        title: "Error updating pulse",
        description: updateError.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleSetGoal = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitGoal = async () => {
    if (!newGoal.trim()) return;

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.email) {
      toast({
        title: "Authentication error",
        description: "Please sign in to set goals",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Get uid from user_profiles using email from auth session
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("uid")
      .eq("email", session.session.user.email)
      .single();

    if (profileError || !userProfile) {
      toast({
        title: "Error finding user profile",
        description: "Please try again later",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("platform_engagement").insert([
      {
        event_id: eventId,
        user_id: userProfile.uid,
        type: "goal",
        content: newGoal.trim(),
        display_name: session.session.user.user_metadata.full_name,
        status: "in_progress",
      },
    ]);

    if (error) {
      toast({
        title: "Error setting goal",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    await incrementPulse(session.session.user.email);
    setIsSubmitting(false);
    toast({
      title: "Goal set successfully",
      description: "Your goal has been saved",
    });
    setNewGoal("");
    setIsDialogOpen(false);
    fetchGoals();
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditedContent(goal.content);
  };

  const handleSaveEdit = async (goalId: string) => {
    if (!editedContent.trim()) return;

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.email) {
      toast({
        title: "Authentication error",
        description: "Please sign in to edit goals",
        variant: "destructive",
      });
      return;
    }

    // Get uid from user_profiles using email from auth session
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("uid")
      .eq("email", session.session.user.email)
      .single();

    if (profileError || !userProfile) {
      toast({
        title: "Error finding user profile",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("platform_engagement")
      .update({ content: editedContent.trim() })
      .eq("id", goalId)
      .eq("user_id", userProfile.uid);

    if (error) {
      toast({
        title: "Error updating goal",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Goal updated successfully",
      description: "Your changes have been saved",
    });

    setEditingGoalId(null);
    setEditedContent("");
    fetchGoals();
  };

  const handleToggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "in_progress" : "completed";
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.email) return;

    // Get uid from user_profiles using email from auth session
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("uid")
      .eq("email", session.session.user.email)
      .single();

    if (profileError || !userProfile) {
      toast({
        title: "Error finding user profile",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("platform_engagement")
      .update({ status: newStatus })
      .eq("id", goal.id)
      .eq("user_id", userProfile.uid);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return;
    }

    if (newStatus === "completed") {
      await incrementPulse(session.session.user.email);
    }

    fetchGoals();
  };

  const handleSelectRecommendation = (recommendation: string) => {
    setNewGoal(recommendation);
  };

  return (
    <>
      <Card className="w-full bg-white shadow-lg rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-blue-900 text-white p-4 rounded-t-xl">
          <CardTitle className="text-2xl font-bold">Your Goals</CardTitle>
          <Button
            onClick={handleSetGoal}
            className="bg-black hover:bg-black/90 text-white rounded-full px-4 py-2"
          >
            Set Goal
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {goals.length === 0 ? (
            <p className="text-gray-600 text-center">
              You haven&apos;t set any goals yet. Click{" "}
              <span className="font-medium text-gray-800">Set Goal</span> to get
              started!
            </p>
          ) : (
            <ul className="space-y-4">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className={`p-4 rounded-lg transition-all ${
                    goal.status === "completed"
                      ? "bg-green-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.status === "completed" ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Done</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          <span className="text-sm font-medium">
                            In Progress
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleToggleStatus(goal)}
                        variant="ghost"
                        className={
                          goal.status === "completed"
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                            : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        }
                      >
                        {goal.status === "completed"
                          ? "Mark as Not Done"
                          : "Mark as Done"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditGoal(goal)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {editingGoalId === goal.id ? (
                    <div className="mt-4">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(goal.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGoalId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {goal.content}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(goal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Set a New Goal
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <Input
              placeholder="Enter your goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitGoal();
              }}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-400"
            />
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Recommendations:
              </h4>
              <ul className="space-y-2">
                {goalRecommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="p-2 rounded-md cursor-pointer hover:bg-indigo-50"
                    onClick={() => handleSelectRecommendation(rec)}
                  >
                    <span className="text-sm text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitGoal}
              disabled={isSubmitting || !newGoal.trim()}
              className="bg-black hover:bg-black/90 text-white rounded px-6 py-2"
            >
              {isSubmitting ? "Setting..." : "Set Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
