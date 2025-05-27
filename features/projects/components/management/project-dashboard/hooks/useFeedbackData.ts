import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FeedbackItem } from "@/lib/types";
import { toast } from "@/lib/hooks/use-toast";

export function useFeedbackData(projectId: string) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!projectId) return;
      
      setIsLoadingFeedback(true);

      try {
        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching feedback:", error);
          toast({
            title: "Error",
            description: "Failed to load project feedback",
            variant: "destructive",
          });
        } else {
          setFeedback(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching feedback:", err);
        toast({
          title: "Error",
          description: "Failed to load project feedback",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [projectId]);

  const refreshFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setFeedback(data);
      }
    } catch (err) {
      console.error("Error refreshing feedback:", err);
    }
  };

  return {
    feedback,
    isLoadingFeedback,
    refreshFeedback,
  };
}